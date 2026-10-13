import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPIC_FORMS, CONVERSATION_UNITS, validTopicForm} from '../src/lib/b1-topic-bank.ts';
test('five points on prepared topic and six official conversation areas',()=>{
 assert.ok(TOPIC_FORMS.every(x=>x.points.length===5));
 assert.equal(CONVERSATION_UNITS.length,6);
 assert.ok(CONVERSATION_UNITS.every(x=>x.starters.length>=3));
});
test('family is for foundation only, not a recommended Grade 5 prepared topic',()=>{
 assert.equal(validTopicForm('family'),false);
 assert.equal(validTopicForm('cooking'),true);
});