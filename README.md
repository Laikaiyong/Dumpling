# 🥟 Dumplings — Agent-as-a-Service on Solana

Dumplings is a no-code platform that lets anyone create powerful, verifiable AI Agents — integrated with the Solana blockchain — as easily as making dumplings.

Built for startups, enterprises, and Web3 builders, Dumplings allows you to deploy intelligent voice-enabled agents that can answer customer questions, analyze on-chain data, and interact with APIs — all with crypto-native features like token-gating, wallet login, and verifiable AI output.

---

## 🚀 Why Dumplings?

Traditional AI assistants are powerful — but they aren't transparent, verifiable, or easily deployable onchain. Dumplings changes that.

With Dumplings, you get:

- **Crypto Billing** in SOL or USDC  
- **AI Agent Builder** for fast deployment  
- **Voice Verification** powered by ElevenLabs  
- **Verifiable AI Output** backed by blockchain transparency  
- **Solana-native integrations** like Helius & CoinGecko APIs

---

## 📦 Key Features

| Feature | Description |
|--------|-------------|
| 🧠 AI Agent Builder | Upload documents, paste URLs, or use templates to spin up your agent |
| 🔗 Blockchain Integration | On-chain data via Helius, token info via CoinGecko |
| 🗣️ Voice Output | Generate and verify speech using ElevenLabs |
| 🔍 Verifiable AI | Every AI output can be hashed/verified onchain for authenticity |
| 📜 Embeddable | Embed agents into your site, Notion, or apps with iframes & APIs |
| 💳 Crypto Billing | Pay and manage plans directly with your wallet |

---

## 💸 Pricing Model

| Plan         | Price/Month | AI Agents | API Calls | Verification     | Support       |
|--------------|-------------|-----------|-----------|------------------|---------------|
| **Free**     | 0 SOL       | 1         | 100       | 0.01 SOL/verify  | –             |
| **Starter**  | 0.5 SOL     | 1         | 1,000     | Basic            | –             |
| **Pro**      | 2.5 SOL     | 5         | 10,000    | Advanced         | –             |
| **Enterprise**| 8 SOL      | 30        | 100,000   | Premium          | 24/7 Support  |
| **Pay-as-you-go** | –     | Flexible  | Flexible  | 0.01 SOL/verify  | –             |

> Assumed SOL Price: ~$170 USD. USDC payment is also supported.

### ⚖️ Profitability Justification

- **LLM (Fetch.ai)**: ~$0.002/call  
- **MongoDB Atlas**: ~$0.01 per 1K reads (scales with usage)  
- **Helius API**: ~$0.0005 per call  
- **CoinGecko API**: Free tier sufficient  
- **ElevenLabs**: $5 for 30K characters (avg. $0.002 per voice output)

At **0.001 SOL per call (~$0.17)**, Dumplings remains profitable while offering a scalable, crypto-native solution.

---

## 🏗️ Architecture

The system consists of:
- **Frontend** (Next.js): Wallet login, agent templates, and billing UI.
- **Voice** (ElevenLabs): Voice responses and audio agent interaction.
- **LLM** (Fetch.ai): Handles chat, RAG, and general intelligence.
- **Intent** (Together.ai): Classifies user intent for smart routing.
- **Document Processing** (HuggingFace): Converts uploads into searchable knowledge.
- **Database** (MongoDB): Stores documents, user configs, and agent data.
- **Token Data** (BirdEye, CoinGecko, GeckoTerminal): Real-time DeFi and token info.
- **On-Chain Data** (Helius): Tracks wallet and transaction activity on Solana.
- **Web Data** (Serper): Pulls fresh search results for real-world context.
- **Smart Contracts** (Solana): Hashes and verifies agent outputs on-chain for transparent, verifiable AI.
  
![Dumplings Architecture](https://github.com/user-attachments/assets/75570455-a28e-4ed5-bf62-69ffea259541)

---

## 🌱 Roadmap

### Phase 1 – Build Core Product (3 months)
- Finalize platform features
- Internal feedback loops
- System integration

### Phase 2 – Grow the Ecosystem
- Launch community & awareness campaigns
- Team growth & collaborations

### Phase 3 – Improve and Scale
- Revise app based on feedback
- Scale user acquisition and API throughput

---

## 🌍 Impact

**For Customers**  
Save time, scale faster, reduce onboarding cost, and delight users with voice-AI chat.

**For Solana Ecosystem**  
Drive network usage with crypto billing, wallet auth, on-chain data interactions — and put **Malaysia on the map** 🇲🇾.

---

## 📣 Community & Updates

Follow us on Twitter [@dumplingsAI](https://x.com/dumplingsAI) for sneak peeks, updates, and behind-the-scenes.

---

## 🧪 Try Dumplings

Start with the free tier and deploy your first agent in minutes:

➡️ https://dumpling-three.vercel.app/

---
