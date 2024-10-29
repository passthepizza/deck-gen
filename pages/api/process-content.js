import { Mistral } from '@mistralai/mistralai';
import axios from 'axios';
import cheerio from 'cheerio';
import pdf from 'pdf-parse';

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, content } = req.body;
    let text = '';

    // Extract text based on input type
    if (type === 'url') {
      const response = await axios.get(content);
      const $ = cheerio.load(response.data);
      // Remove script tags, style tags, and comments
      $('script, style, comment').remove();
      text = $('body').text().trim();
    } else if (type === 'pdf') {
      const dataBuffer = Buffer.from(content, 'base64');
      const pdfData = await pdf(dataBuffer);
      text = pdfData.text;
    }

    // Generate flashcards using Mistral AI
    const prompt = `Create Anki flashcards from the following text. Format each card as "Q: question\nA: answer" with a blank line between cards. Focus on key concepts and important details:\n\n${text}`;

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
    });

    const flashcardsText = response.choices[0].message.content;
    
    // Parse flashcards into structured format
    const flashcards = flashcardsText.split('\n\n')
      .map(card => {
        const [question, answer] = card.split('\nA: ');
        return {
          question: question.replace('Q: ', ''),
          answer: answer
        };
      })
      .filter(card => card.question && card.answer);

    res.status(200).json({ flashcards });
  } catch (error) {
    console.error('Error processing content:', error);
    res.status(500).json({ error: 'Failed to process content' });
  }
}
