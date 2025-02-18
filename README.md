# **Sort-of-Fun** 🎲✨  
_A modern board game collection and recommendation system_  

## **About the Project**  
**Sort-of-Fun** is a web application designed to help board game enthusiasts organize their collection, analyze game details, and find the best games based on player count, complexity, and playtime. It integrates with **BoardGameGeek (BGG)** to fetch game data and allows users to filter, sort, and score games dynamically. 

---

## **Tech Stack**  
🟢 **Frontend:** SvelteKit, JavaScript  
🟢 **Backend:** Node.js, Express.js  
🟢 **Database:** SQLite + Knex.js  
🟢 **API Integration:** BoardGameGeek XML API  

---

## **Getting Started**  

### **Prerequisites**  
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)  
- [Git](https://git-scm.com/)  
- [SQLite](https://www.sqlite.org/download.html)  

---

### **Installation**  

#### **1. Clone the Repository**  
```sh
git clone https://github.com/YOUR_USERNAME/sort-of-fun.git
cd sort-of-fun
```

#### **2. Install Dependencies**  
```sh
npm install
```

#### **3. Set Up Environment Variables**
Create a `.env` file in the root directory and add the following environment variables:
```sh
BGG_USERNAME=your_bgg_username
PORT=3000
DB_FILE=./boardgames.sqlite
```

#### **4. Run Database Setup & Fetch Data
```sh
npm run setup
```

This will create the necessary tables and fetch board games from BoardGameGeek.

#### **5. Start the Development Server**  
```sh
npm run dev
```

Open http://localhost:3000 in your browser.

---

