const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const Replicate = require("replicate");
const app = express();
const PORT = 4000;
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
require('dotenv').config();

// Initialize Replicate API
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Connect to the database
connectDB();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000', // Update with your frontend URL
    credentials: true, // Allow credentials such as cookies
};
app.use(cors(corsOptions));

// Generate a unique ID for each resume entry
const generateID = () => Math.random().toString(36).substring(2, 10);

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
});

// Function to call the Replicate API
const ReplicateFunction = async (text, chapterTitle) => {
    const output = await replicate.run(
        "georgedavila/cog-tex2pdf:f542dafd582b2143ca6924e5fcc47aeca132a19aad0fb1cc6033abbc16fa6c4f",
        {
            input: {
                textInput: text,
                chapterTitleInput: chapterTitle,
            }
        }
    );
    return output;
};

// In-memory database for resumes
let database = [];

// Route to create a resume
app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
    const {
        fullName,
        currentPosition,
        currentLength,
        currentTechnologies,
        workHistory,
    } = req.body;

    const workArray = JSON.parse(workHistory);
    const newEntry = {
        id: generateID(),
        fullName,
        image_url: `http://localhost:4000/uploads/${req.file.filename}`,
        currentPosition,
        currentLength,
        currentTechnologies,
        workHistory: workArray,
    };

    const prompt1 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I write in the technologies: ${currentTechnologies}. Can you write a 100 words description for the top of the resume (first person writing)?`;

    const prompt2 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I write in the technologies: ${currentTechnologies}. Can you write 10 points for a resume on what I am good at?`;

    const remainderText = () => {
        let stringText = "";
        for (let i = 0; i < workArray.length; i++) {
            stringText += ` ${workArray[i].name} as a ${workArray[i].position}.`;
        }
        return stringText;
    };

    const prompt3 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n During my years I worked at ${workArray.length} companies. ${remainderText()} \n Can you write me 50 words for each company separated in numbers of my succession in the company (in first person)?`;

    try {
        const objective = await ReplicateFunction(prompt1, "Objective");
        const keypoints = await ReplicateFunction(prompt2, "Key Points");
        const jobResponsibilities = await ReplicateFunction(prompt3, "Job Responsibilities");

        const replicateData = { objective, keypoints, jobResponsibilities };
        const data = { ...newEntry, ...replicateData };
        database.push(data);

        res.json({
            message: "Request successful!",
            data,
        });
    } catch (error) {
        console.error("Error creating resume:", error);
        res.status(500).json({
            message: "An error occurred while creating the resume",
            error: error.message,
        });
    }
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
