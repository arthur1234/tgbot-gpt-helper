import OpenAI from 'openai';
import config from 'config'
import { createReadStream } from "fs";

class OpenAiService {

    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system'
    }

    constructor(apiKey) {
        this.openai1 = new OpenAI({ apiKey });
    }

    async chat(msg) {
        try {
            const response = await this.openai1.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: msg
            })
            
            return response.choices[0].message

        } catch (e) {
            console.log('Error while gpt chat', e)
        }
    }
    
    async transcription(filepath) {
        try {
            const response = await this.openai1.audio.transcriptions.create({
              model: 'whisper-1',
              file: createReadStream(filepath),
            });

            console.log(response);
            return response
        } catch (e) {
            console.log('transcription error :: ', e)
        }
    }
}

console.log("API Key:", config.get('OPENAI_KEY')); // Это должно показать ваш ключ API
export const openai = new OpenAiService(config.get('OPENAI_KEY'))
