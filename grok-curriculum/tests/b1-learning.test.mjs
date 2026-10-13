import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAINING_STAGES, CONVERSATION_AREAS, parseProgress, stageCoachRules, addObservation, progressSummary, practiceReminder } from '../src/lib/b1-learning.ts';

test('five progressive stages and all six Grade 5 areas', () => {
 assert.equal(TRAINING_STAGES.length, 5);
 assert.equal(CONVERSATION_AREAS.length, 6);
 assert.equal(TRAINING_STAGES.at(-1).id, 'exam');
});
test('beginner fragments are grounded, no invented personal facts', () => {
 assert.match(stageCoachRules('words'), /do not invent/i);
 assert.match(stageCoachRules('words'), /one/i);
});
test('exam stage has no in-exam hints and no pass guarantees', () => {
 assert.match(stageCoachRules('exam'), /no coaching/);
 assert.match(stageCoachRules('exam'), /never claim/i);
});
test('corrupt saved state safely falls back', () => {
 assert.equal(parseProgress(null).selectedStage, 'words');
 assert.equal(parseProgress({ selectedStage:'evil', observations:[{bad:1}] }).observations.length,0);
});
test('skill observation aggregation is transparent, not official grading', () => {
 const p=addObservation(parseProgress({selectedStage:'sentences'}),{at:'2026-10-13',stage:'sentences',topic:'Cooking',answeredWithSentence:true,gaveReason:false,askedQuestion:false,understoodFollowup:true});
 assert.equal(progressSummary(p).completeSentence,1);
 assert.match(practiceReminder('exam'),/唔係 Trinity 官方分數/);
});