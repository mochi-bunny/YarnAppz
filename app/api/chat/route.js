import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

const systemPrompt= `
You are a Job description summary generator for job applicants. For each user input, you will generate a summary of job for the a job applicant.

For each user query, you should:

1. Analyze the user's request to understand their needs and preferences.
2. Use RAG (Retrieval-Augmented Generation) to search the database and find the most relevant job titles.
3. Present the top 5 job that best match the query.
4. For each job, provide:
   - Job Title : name of the job role such as Software engineer
   - Domain : Field under which the role falls such as data science, oil and gas etc
   - Job Description : Brief summary of the job
   - Qualifications : Level of education such as Bsc, BE etc
   - Experience : Years of experience required such as 3-4 years
   - Skills : Required technical and soft skills for the job such as Python, Adaptive etc
   - Responsibilities: Tasks involved in the job such as creating dashboards

5. After presenting the top 5 options, offer to provide more details or answer any follow-up questions the job applicant might have.

Remember to be impartial and base your recommendations solely on the available data and reviews. If the query is too vague or there isn't enough information to make a good recommendation, ask for clarification.
   
Example user queries might include:
   - "I want to be a software engineer."
   - "What skills do i need to become a data scientist?"
   - "Programs for becoming a social media intern."
   
   Respond in a friendly, helpful manner, and always prioritize the job applicant's learning experience in your recommendations.
`

export async function POST(req){
    
    const data= await req.json() 

    const client = new GoogleGenerativeAI(
        process.env.GEMINI_KEY // Ensure your API key is securely stored in environment variables
  );
  

  const genai = client.getGenerativeModel(
    { model: "embedding-001",  generationConfig: { responseMimeType: "application/json"} }
  );

  const text= data[data.length-1].content

    let embedding = await genai.embedContent(
        text
    )
    
    embedding = embedding["embedding"]["values"]
   

    const pc=new Pinecone( {apiKey: process.env.PINECONE_API_KEY})

    console.log("loaded pinecone")

    const index= pc.Index('jd-dbs')
    console.log('done') 
    
    
    const results= await index.query({
        topK:1,
        includeMetadata: true,
        vector: embedding
    })

    //console.log(results)
    let resultString= '' 


    results.matches.forEach((match) => { 
        resultString+= `\n
        Job Title: ${match.metadata["Role"]}
        Domain: ${match.metadata["Job Title"]}
        Job Description: ${match.metadata["Job Description"]}
        Qualifications: ${match.metadata["Qualifications"]}
        Experience: ${match.metadata["Experience"]}
        Salary Range: ${match.metadata["Salary Range"]}
        Summary: ${match.metadata["Summary"]}
        `
    });

    const lastMessage = data[data.length-1]

    const lastMessageContent = lastMessage.content+ resultString
    let lastDataWithoutMessage=data.slice(0, data.length-1)
    lastDataWithoutMessage = lastDataWithoutMessage.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
    }));

   console.log(JSON.stringify( lastMessageContent )+"\n**\n")

    const genai2= client.getGenerativeModel(
        { model: "gemini-1.5-flash",  generationConfig: { responseMimeType: "application/json" }}
      );

    let systemPrompt2= `You are a job applicant tutor.
    Your role is to guide the job applicant using the provided information by generating a report of the provided information such that the user can easily navigate through it to attain their desired career. 
    If the job contents does not match the job title, then cater the information in such a way that they do match.
    Remember to be impartial and base your recommendations solely on the available data and reviews. If the query is too vague or there isn't enough information to make a good recommendation, ask for clarification.
   
Example user queries might include:
   - "I want to be a software engineer."
   - "What skills do i need to become a data scientist?"
   - "Programs for becoming a social media intern." 

   Respond in a friendly, helpful manner, and always prioritize the job applicant's learning experience in your recommendations.
     `
   
    const completion = await genai2.generateContent( {  
      contents:  [
            {role: 'model', parts: [{text: systemPrompt2}]},
            ...lastDataWithoutMessage, 
            {role: 'user', parts:[{text: lastMessageContent}]}
        ], 
}) 
  
 
    let stream = completion.response?.candidates[0].content.parts[0].text;
    console.log("stream:" + JSON.stringify(stream))  

    return NextResponse.json(JSON.parse(stream));
}