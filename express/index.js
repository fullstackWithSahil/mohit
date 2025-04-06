const {Ollama} = require('ollama'); // Ensure correct import
const express = require('express');
const cors = require('cors');
const app = express();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (add these to environment variables in production)
const supabaseUrl = 'https://azfhvfraopxkfbmbswpe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Zmh2ZnJhb3B4a2ZibWJzd3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDA5NzEsImV4cCI6MjA1OTQxNjk3MX0.lhc70vgOHxqcujsoolseF6Wo8z4I5OIoh4FthRY_uWo';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })

function filterIrrelevantComments(comments) {
    if (!comments || comments.length === 0) return [];
    
    const nonEmptyComments = comments.filter(comment => 
      comment && comment.trim() !== ''
    );
    
    return nonEmptyComments.filter(comment => {
      const lowerComment = comment.toLowerCase();
      const hasEmoji = /[\p{Emoji}]/u.test(comment);
      const genericPhrases = [
        'nice video', 'great video', 'awesome video', 'love this',
        'thanks for sharing', 'subscribed', 'first comment', 'i was here',
        '👍', '❤️', 'like if you agree', 'check out my', 'please subscribe',
        'who else is watching', 'notification squad', 'early gang', 'cool video'
      ];
      
      const containsGenericPhrase = genericPhrases.some(phrase => lowerComment.includes(phrase));
      const isTooShort = comment.length < 15;
      const hasOnlySymbols = /^[^\w\s]*$/.test(comment);
      const isMostlyUppercase = (comment.match(/[A-Z]/g) || []).length > comment.length * 0.7;
      const hasExcessivePunctuation = (comment.match(/[!?]/g) || []).length > 3;
      
      return !hasEmoji && !containsGenericPhrase && !isTooShort &&
             !hasOnlySymbols && !isMostlyUppercase && !hasExcessivePunctuation;
    });
}

app.post("/filterComments", async (req, res) => {
    try {
        const relevantComments = filterIrrelevantComments(req.body.comments);
        res.status(200).json({ relevant: relevantComments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error filtering comments" });
    }
});

app.post("/removeComments", async (req, res) => {
  const comments = req.body.comments;
  res.status(200).json({ comments });  
});

app.post("/summarizeComments", async (req, res) => {
  try {
    const { query, comments } = req.body;

    if (!query || !Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const prompt = `
    I am making a YouTube video with the title: "${query}". 
    Here are some comments from the top 10 videos on this topic:

    "${comments.join('\n')}" 

    Analyze these comments and provide a summary with insights and suggestions for making my video better.
    `;

    const response = await ollama.generate({
      model: "llama3:8b",
      prompt
    });

    if (!response || !response.response) {
      throw new Error("Invalid response from Ollama API");
    }

    res.json({ summary: response.response });

  } catch (error) {
    console.error("Error summarizing comments:", error);
    res.status(500).json({ error: "Something went wrong while summarizing comments." });
  }
});


app.post("/indexing", async (req, res) => {
  try {
    const { comments,metadata } = req.body;
    
    if (!comments || !Array.isArray(comments)) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    // Generate embedding
    for(const prompt of comments) {
      const data = await ollama.embeddings({ 
        model: 'nomic-embed-text', 
        prompt 
      });
      
      if (!data || !data.embedding) {
        throw new Error("Failed to generate embedding");
      }
      
      // Store in Supabase
      const { error } = await supabase
        .from('embeddings')
        .insert({
          content: prompt,
          embedding: data.embedding,
          metadata: metadata || {},
        });
        
      if (error) throw error;
    }
    
    res.status(200).json({ success: true, message: "Document indexed successfully" });
  } catch (error) {
    console.error("Error in /indexing:", error);
    res.status(500).json({ error: "Something went wrong during indexing." });
  }
});

app.post("/query", async (req, res) => {
  try {
    const { query,question,comments, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    
    // Generate embedding for the query
    const data = await ollama.embeddings({ 
      model: 'nomic-embed-text', 
      prompt: question
    });
    
    if (!data || !data.embedding) {
      throw new Error("Failed to generate query embedding");
    }
    
    // Query Supabase using vector similarity search
    // Note: This assumes you've set up a vector column and similarity search in Supabase
    const { data: results, error } = await supabase
      .rpc('match_embeddings', {
        query_embedding: data.embedding,
        match_threshold: 0.7,
        match_count: limit
      });
      
    if (error) throw error;

    const topComments= results.map(r => r.content).join(" ")?results.map(r => r.content).join(" "):comments.join(" ");

    const prompt = `
    I am making a YouTube video with the title: "${query}". these are the top comments from that video ${topComments} based on these comments i want you to answer this question: "${question}" and if you think the comments are not conclusive you can answer it based on your own knowledge.`

    const response = await ollama.generate({
      model: "llama3:8b",
      prompt
    });

    if (!response || !response.response) {
      throw new Error("Invalid response from Ollama API");
    }

    res.json({ response: response.response });
    
  } catch (error) {
    console.error("Error in /query:", error);
    res.status(500).json({ error: "Something went wrong during query." });
  }
});


app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
