# B1 講得掂 · Grok-derived adaptive curriculum prototype

This source is a **development snapshot**, not a finished product. It retains the original Grok voice code paths, and adds a five-stage beginner-to-B1 teaching scaffold. It is **not a working zero-cost independent voice application**: the original voice endpoints require xAI services.

Before ANY live deployment, review `docs/GROK-INTEGRATION-AUDIT.md`. User does **not** agree to paid API billing, so xAI calls require the deliberately disabled `B1_ALLOW_BILLED_XAI` gate and must not be activated without fresh express approval. No secrets are included.

Files updated: `src/lib/scenes.ts`, `src/lib/tutor.functions.ts`, `src/components/booth.tsx`; new `src/lib/b1-learning.ts`, `src/lib/b1-topic-bank.ts`, 7 basic tests.

The originally working Grok sandbox is untouched. Its public preview may depend on provider-hosted secrets/service quotas; an exported copy will not automatically receive them. The user's Study App repo/deployment is untouched.