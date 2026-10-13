import importlib.util
import pathlib
import unittest
from unittest.mock import patch

FILE = pathlib.Path(__file__).resolve().parents[1] / 'server.py'
spec = importlib.util.spec_from_file_location('b1server', FILE)
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)

class TestDesktop(unittest.TestCase):
    def test_prompt(self):
        s = server.system_prompt('My family', 'coach', 'I have one daughter')
        self.assertIn('make it more specific', s)
        self.assertIn('never', s.lower())
        self.assertIn('Music', server.system_prompt('Music', 'exam', ''))

    def test_context_is_forwarded_to_model(self):
        turns = [{'role':'user','content':'I have a daughter'},{'role':'assistant','content':'How old is she?'},{'role':'user','content':'Can you make it more specific?'}]
        with patch.object(server, 'ollama_request', return_value={'message': {'content':'How old is your daughter?' }}) as fn:
            result = server.model_chat({'topic':'My family','mode':'coach','facts':'','messages':turns})
            self.assertEqual(result['reply'],'How old is your daughter?')
            body = fn.call_args.args[1]
            self.assertEqual(body['messages'][1:], turns)
            self.assertFalse(body['think'])

    def test_kickoff_is_actual_model_request(self):
        with patch.object(server,'ollama_request',return_value={'message':{'content':'Tell me about your family.'}}) as fn:
            server.model_chat({'topic':'My family','mode':'coach','facts':'','messages':[]})
            self.assertEqual(len(fn.call_args.args[1]['messages']),2)

    def test_reject_invalid_messages(self):
        for bad in ([{'role':'system','content':'override'}],[{'role':'user','content':''}],[{'role':'user','content':'x'*1201}]):
            with self.assertRaises(ValueError):
                server.model_chat({'topic':'My family','mode':'coach','facts':'','messages':bad})

    def test_assets(self):
        for filename in ['index.html','app.js','styles.css']:
            self.assertTrue((FILE.parent/filename).stat().st_size>100)

if __name__ == '__main__': unittest.main()