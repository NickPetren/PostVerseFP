import mongoose from 'mongoose';
import readline from 'readline';
import DatabaseCleanup from './DatabaseCleanup.js';  // <-- Добавляем .mjs

const DB_URL = 'mongodb+srv://Nick:1234@cluster0.cssn3.mongodb.net/final-project_data?retryWrites=true&w=majority&appName=Cluster0';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.toLowerCase());
        });
    });
}

async function runCleanup() {
    try {
        console.log('SAFETY CHECK');
        console.log('============');
        console.log('This script will remove only:');
        console.log('1. Posts from deleted users');
        console.log('2. Comments on those posts');
        console.log('3. Notifications related to those posts');
        console.log('\nIt will NOT delete:');
        console.log('- Any existing users');
        console.log('- Posts from existing users');
        console.log('- Any other data');
        
        const proceed = await askQuestion('\nDo you want to proceed? (yes/no): ');
        
        if (proceed !== 'yes') {
            console.log('Operation cancelled by user');
            process.exit(0);
        }

        console.log('\nConnecting to database...');
        await mongoose.connect(DB_URL);
        console.log('Connected successfully to MongoDB');

        await DatabaseCleanup.runCleanup();
        
        console.log('\nCleanup completed, disconnecting...');
        await mongoose.disconnect();
        
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('\nFatal error during cleanup:', error);
        await mongoose.disconnect();
        rl.close();
        process.exit(1);
    }
}

runCleanup();