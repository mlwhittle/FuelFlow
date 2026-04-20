import fs from 'fs';
import path from 'path';

const searchStr = 'FuelFlow';
const replaceStr = 'Whittle Vitalio';
// Let's also do 'fuelflow.app' to 'whittlevitalio.com' for shepherd.js
const emailSearch = 'fuelflow.app';
const emailReplace = 'whittlevitalio.com';

const filesToUpdate = [
    'src/services/socialService.js',
    'src/services/googleFitService.js',
    'src/services/barcodeService.js',
    'src/services/aiSpiritualService.js',
    'src/services/aiCoachService.js',
    'src/firebase.js',
    'src/components/FoundersClubUpsell.jsx',
    'src/components/GroceryList.jsx',
    'src/components/Header.jsx',
    'src/components/MedicalDisclaimerModal.jsx',
    'src/components/PremiumGate.jsx',
    'src/components/Settings.jsx',
    'src/components/SignUp.jsx',
    'src/components/SubscriptionSuccess.jsx',
    'src/components/UserManual.jsx',
    'src/components/OnboardingFlow.jsx',
    'src/components/Login.jsx',
    'src/App.jsx',
    'server/orchestrator.js',
    'server/agents/shepherd.js',
    'public/sw.js',
    'public/privacy-policy.html',
    'index.html',
    'functions/package.json'
];

for (const p of filesToUpdate) {
    const fullPath = path.resolve(p);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/FuelFlow/g, replaceStr);
        content = content.replace(/fuelflow\.app/g, emailReplace);
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + p);
    }
}
