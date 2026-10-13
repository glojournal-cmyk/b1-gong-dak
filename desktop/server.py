"""Local B1 English tutor with genuine Ollama inference; no paid APIs."""
from __future__ import annotations
import json
import os
import pathlib
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

HERE = pathlib.Path(__file__).resolve().parent
PORT = int(os.getenv('B1_PORT', '8765'))
MODEL = os.getenv('B1_MODEL', 'qwen3:1.7b')
OLLAMA = 'http://127.0.0.1:11434'
TOPICS = {'My family', 'My work', 'My life in the UK', 'Festivals', 'Means of Transport', 'Special Occasions', 'Entertainment', 'Music', 'Recent Personal Experiences'}


def system_prompt(topic, mode, facts):
    instruction = ('Be an encouraging, patient English coach. If the learner uses fragments, model a complete sentence based on their own words, then ask one natural follow-up. Offer a little Cantonese-style Traditional Chinese explanation if they need help.' if mode == 'coach' else 'Act as a simulated B1 English examiner: ask one question at a time, respond naturally, and do not correct mistakes until the end. Do not claim to be a real examiner.')
    return f'''You are an interactive British English coach for adult Cantonese-speaking learners preparing for a B1 English speaking/listening test. This is a real two-way dialogue, not a keyword quiz.
Topic: {topic}. Mode: {mode}.
Only these personal facts have been confirmed: {facts or 'None supplied.'}
{instruction}
Always respond to the user's ACTUAL message. If asked "What would you like to ask?", offer a relevant specific question. If asked "Can you make it more specific?", clarify your previous question. For "One daughter", model "I have one daughter", but NEVER invent her age. If they later say "She is 13", remember it in this conversation. For "I don't understand", explain and rephrase the current question, not the original default prompt. Use prior turns to keep conversation coherent. If they ask a different question, answer it before continuing.
Keep replies short: 1-3 simple British English sentences and ONE question at most. No fabricated facts, no pass guarantees, no claiming to hear sound (typed test version). Never give a canned reply unrelated to the actual user turn.'''


def ollama_request(path, payload=None):
    data = None if payload is None else json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(OLLAMA + path, data=data, headers={'Content-Type': 'application/json'} if data else {}, method='POST' if data else 'GET')
    with urllib.request.urlopen(request, timeout=180 if data else 5) as resp:
        return json.loads(resp.read(1000000).decode('utf-8'))


def model_chat(data):
    topic, mode = data.get('topic', 'My family'), data.get('mode', 'coach')
    facts, turns = data.get('facts', ''), data.get('messages', [])
    if topic not in TOPICS or mode not in ('coach', 'exam') or not isinstance(facts, str) or len(facts) > 2000 or not isinstance(turns, list) or len(turns) > 32:
        raise ValueError('Invalid session configuration')
    messages = [{'role': 'system', 'content': system_prompt(topic, mode, facts)}]
    for turn in turns:
        if not isinstance(turn, dict) or turn.get('role') not in ('user', 'assistant') or not isinstance(turn.get('content'), str) or not 0 < len(turn['content']) <= 1200:
            raise ValueError('Invalid conversation turn')
        messages.append({'role': turn['role'], 'content': turn['content']})
    if len(messages) == 1:
        messages.append({'role': 'user', 'content': 'Please begin this session by asking one specific short question about the selected topic.'})
    response = ollama_request('/api/chat', {'model': MODEL, 'messages': messages, 'stream': False, 'think': False, 'options': {'temperature': .55, 'num_predict': 180, 'num_ctx': 4096}})
    answer = response.get('message', {}).get('content', '')
    if not isinstance(answer, str) or not answer.strip():
        raise RuntimeError('Local model produced no reply')
    return {'reply': answer.strip(), 'model': MODEL}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Never print any learner sentences or personal details to the console.
        if self.command == 'GET':
            super().log_message(fmt, *args)

    def reply(self, status, content):
        data = json.dumps(content, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(data)

    def trusted(self):
        return self.headers.get('Host') in (f'127.0.0.1:{PORT}', f'localhost:{PORT}')

    def do_GET(self):
        if not self.trusted():
            return self.reply(403, {'error': 'Local-only website'})
        path = urlparse(self.path).path
        if path == '/api/health':
            try:
                models = ollama_request('/api/tags').get('models', [])
                installed = [x.get('name', '') for x in models if isinstance(x, dict)]
                ready = MODEL in installed
                return self.reply(200, {'ready': ready, 'model': MODEL, 'error': None if ready else 'Please download the model using Ollama'})
            except Exception:
                return self.reply(200, {'ready': False, 'model': MODEL, 'error': 'Ollama is not running'})
        files = {'/': ('index.html', 'text/html; charset=utf-8'), '/index.html': ('index.html', 'text/html; charset=utf-8'), '/app.js': ('app.js', 'text/javascript; charset=utf-8'), '/styles.css': ('styles.css', 'text/css; charset=utf-8')}
        if path not in files:
            return self.reply(404, {'error': 'Not found'})
        name, mimetype = files[path]
        content = (HERE / name).read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', mimetype)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Content-Security-Policy', "default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'")
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        origin = self.headers.get('Origin')
        if not self.trusted() or (origin and origin not in (f'http://localhost:{PORT}', f'http://127.0.0.1:{PORT}')):
            return self.reply(403, {'error': 'Only requests from this PC are allowed'})
        if urlparse(self.path).path != '/api/chat':
            return self.reply(404, {'error': 'Not found'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 50000:
                raise ValueError('Invalid request size')
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError('Expected JSON object')
            return self.reply(200, model_chat(data))
        except (ValueError, json.JSONDecodeError) as e:
            return self.reply(400, {'error': str(e)})
        except urllib.error.URLError:
            return self.reply(503, {'error': 'Ollama is not running. Open the Ollama app first.'})
        except TimeoutError:
            return self.reply(504, {'error': 'Local model timed out; try a smaller model.'})
        except Exception as e:
            return self.reply(503, {'error': f'Local model failed ({type(e).__name__}). No fake scripted answer has been substituted.'})


def main():
    with ThreadingHTTPServer(('127.0.0.1', PORT), Handler) as host:
        print(f'B1 local desktop coach: http://127.0.0.1:{PORT}\nModel: {MODEL} via Ollama. Ctrl+C to stop.')
        host.serve_forever()

if __name__ == '__main__':
    main()