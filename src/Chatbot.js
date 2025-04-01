import { useState, useContext, useEffect, useRef } from "react";
import VideoRecommendations from './components/VideoRecommendations';
import './Chatbot.css';
import './Prescription.css';
import { Trash2, Send } from "lucide-react";
import Prescription from "./Prescription";
const languages = {
  english: {
    welcome: "Hello! I'm MEDICONNECT, your medical assistant. How can I help you today?",
    placeholder: "Type your medical question...",
    notFound: "I'm sorry, I don't have specific information about that. Please consult a healthcare professional for accurate medical advice.",
    askMedicine: "Have you taken any medication for this?",
    askWhichMedicine: "Which medication have you taken?",
    askDuration: "How long have you been experiencing these symptoms?",
    suggestConsult: "If symptoms persist or worsen, please consult a healthcare professional.",
    recommendRemedies: "Here are some remedies you can try:",
    recommendMedication: "If you haven't taken any medication, you can consider these over-the-counter options:",
    correctMedication: "You mentioned taking {0}. This is an appropriate medication for your symptoms.",
    incorrectMedication: "The medication you mentioned ({0}) may not be the most appropriate for your symptoms. Here are some more suitable options:", 
    clearChat: "Clear Chat",
    disclaimer: "THIS CHATBOT IS MADE UP BY MEDICONNECT GUYS ...",
    greeting: "Hello! How may I help you?",
    thankYou: "Welcome!!!"
  },
  hindi: {
    welcome: "नमस्ते! मैं MEDICONNECT हूं, आपका चिकित्सा सहायक। आज मैं आपकी कैसे मदद कर सकता हूं?",
    placeholder: "अपना चिकित्सा प्रश्न टाइप करें...",
    notFound: "मुझे इस बारे में विशेष जानकारी नहीं है। कृपया सटीक चिकित्सा सलाह के लिए किसी स्वास्थ्य सेवा पेशेवर से परामर्श करें।",
    askMedicine: "क्या आपने इसके लिए कोई दवा ली है?",
    askWhichMedicine: "आपने कौन सी दवा ली है?",
    askDuration: "आप कब से इन लक्षणों का अनुभव कर रहे हैं?",
    suggestConsult: "यदि लक्षण बने रहते हैं या बिगड़ जाते हैं, तो कृपया किसी स्वास्थ्य सेवा पेशेवर से परामर्श करें।",
    recommendRemedies: "यहां कुछ उपाय हैं जिन्हें आप आजमा सकते हैं:",
    recommendMedication: "यदि आपने कोई दवा नहीं ली है, तो आप इन ओवर-द-काउंटर विकल्पों पर विचार कर सकते हैं:",
    correctMedication: "आपने {0} लेने का उल्लेख किया। यह आपके लक्षणों के लिए एक उपयुक्त दवा है।",
    incorrectMedication: "आपके द्वारा उल्लेखित दवा ({0}) आपके लक्षणों के लिए सबसे उपयुक्त नहीं हो सकती है। यहां कुछ अधिक उपयुक्त विकल्प हैं:",
    clearChat: "चैट साफ़ करें",
    disclaimer: "यह चैटबॉट MEDICONNECT द्वारा बनाया गया है ...",
    greeting: "नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?",
    thankYou: "स्वागत है!!!"
  },
  marathi: {
    welcome: "नमस्कार! मी MEDICONNECT आहे, तुमचा वैद्यकीय सहाय्यक. आज मी तुमची कशी मदत करू शकतो?",
    placeholder: "तुमचा वैद्यकीय प्रश्न टाइप करा...",
    notFound: "मला याबद्दल विशिष्ट माहिती नाही. कृपया अचूक वैद्यकीय सल्ल्यासाठी आरोग्य सेवा व्यावसायिकाचा सल्ला घ्या.",
    askMedicine: "तुम्ही यासाठी कोणतेही औषध घेतले आहे का?",
    askWhichMedicine: "तुम्ही कोणते औषध घेतले आहे?",
    askDuration: "तुम्हाला किती काळापासून ही लक्षणे जाणवत आहेत?",
    suggestConsult: "जर लक्षणे कायम राहिली किंवा वाढली तर कृपया आरोग्य सेवा व्यावसायिकाचा सल्ला घ्या.",
    recommendRemedies: "येथे काही उपाय आहेत जे तुम्ही करून पाहू शकता:",
    recommendMedication: "जर तुम्ही कोणतेही औषध घेतले नसेल, तर तुम्ही या ओव्हर-द-काउंटर पर्यायांचा विचार करू शकता:",
    correctMedication: "तुम्ही {0} घेतल्याचा उल्लेख केला. हे तुमच्या लक्षणांसाठी योग्य औषध आहे.",
    incorrectMedication: "तुम्ही उल्लेख केलेले औषध ({0}) तुमच्या लक्षणांसाठी सर्वात योग्य नसू शकते. येथे काही अधिक योग्य पर्याय आहेत:",
    clearChat: "चॅट साफ करा",
    disclaimer: "हा चॅटबॉट MEDICONNECT द्वारे तयार केला आहे ...",
    greeting: "नमस्कार! मी तुमची कशी मदत करू शकतो?",
    thankYou: "स्वागत आहे!!!"
  },
  punjabi: {
    welcome: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ MEDICONNECT ਹਾਂ, ਤੁਹਾਡਾ ਮੈਡੀਕਲ ਅਸਿਸਟੈਂਟ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    placeholder: "ਆਪਣਾ ਮੈਡੀਕਲ ਸਵਾਲ ਟਾਈਪ ਕਰੋ...",
    notFound: "ਮੈਨੂੰ ਇਸ ਬਾਰੇ ਵਿਸ਼ੇਸ਼ ਜਾਣਕਾਰੀ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਮੈਡੀਕਲ ਸਲਾਹ ਲਈ ਕਿਸੇ ਸਿਹਤ ਸੇਵਾ ਪੇਸ਼ੇਵਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।",
    askMedicine: "ਕੀ ਤੁਸੀਂ ਇਸ ਲਈ ਕੋਈ ਦਵਾਈ ਲਈ ਹੈ?",
    askWhichMedicine: "ਤੁਸੀਂ ਕਿਹੜੀ ਦਵਾਈ ਲਈ ਹੈ?",
    askDuration: "ਤੁਸੀਂ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਇਹ ਲੱਛਣ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?",
    suggestConsult: "ਜੇ ਲੱਛਣ ਬਣੇ ਰਹਿੰਦੇ ਹਨ ਜਾਂ ਖਰਾਬ ਹੋ ਜਾਂਦੇ ਹਨ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਕਿਸੇ ਸਿਹਤ ਸੇਵਾ ਪੇਸ਼ੇਵਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।",
    recommendRemedies: "ਇੱਥੇ ਕੁਝ ਉਪਾਅ ਹਨ ਜੋ ਤੁਸੀਂ ਅਜ਼ਮਾ ਸਕਦੇ ਹੋ:",
    recommendMedication: "ਜੇ ਤੁਸੀਂ ਕੋਈ ਦਵਾਈ ਨਹੀਂ ਲਈ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਇਹਨਾਂ ਓਵਰ-ਦ-ਕਾਉਂਟਰ ਵਿਕਲਪਾਂ ਬਾਰੇ ਵਿਚਾਰ ਕਰ ਸਕਦੇ ਹੋ:",
    correctMedication: "ਤੁਸੀਂ {0} ਲੈਣ ਦਾ ਜ਼ਿਕਰ ਕੀਤਾ। ਇਹ ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਲਈ ਇੱਕ ਉਚਿਤ ਦਵਾਈ ਹੈ।",
    incorrectMedication: "ਤੁਹਾਡੇ ਦੁਆਰਾ ਦੱਸੀ ਗਈ ਦਵਾਈ ({0}) ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਲਈ ਸਭ ਤੋਂ ਉਚਿਤ ਨਹੀਂ ਹੋ ਸਕਦੀ। ਇੱਥੇ ਕੁਝ ਹੋਰ ਉਚਿਤ ਵਿਕਲਪ ਹਨ:",
    clearChat: "ਚੈਟ ਸਾਫ਼ ਕਰੋ",
    disclaimer: "ਇਹ ਚੈਟਬੋਟ MEDICONNECT ਦੁਆਰਾ ਬਣਾਇਆ ਗਿਆ ਹੈ ...",
    greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    thankYou: "ਜੀ ਆਇਆਂ ਨੂੰ!!!"
  },
  tamil: {
    welcome: "வணக்கம்! நான் MEDICONNECT, உங்கள் மருத்துவ உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    placeholder: "உங்கள் மருத்துவ கேள்வியை தட்டச்சு செய்யவும்...",
    notFound: "மன்னிக்கவும், இதைப் பற்றி எனக்கு குறிப்பிட்ட தகவல் இல்லை. துல்லியமான மருத்துவ ஆலோசனைக்கு ஒரு சுகாதார நிபுணரை அணுகவும்.",
    askMedicine: "இதற்காக நீங்கள் ஏதேனும் மருந்து எடுத்துள்ளீர்களா?",
    askWhichMedicine: "நீங்கள் எந்த மருந்தை எடுத்துள்ளீர்கள்?",
    askDuration: "இந்த அறிகுறிகளை நீங்கள் எவ்வளவு காலமாக அனுபவிக்கிறீர்கள்?",
    suggestConsult: "அறிகுறிகள் தொடர்ந்து இருந்தால் அல்லது மோசமடைந்தால், ஒரு சுகாதார நிபுணரை அணுகவும்.",
    recommendRemedies: "இங்கே சில வழிமுறைகள் உள்ளன, அவற்றை முயற்சிக்கலாம்:",
    recommendMedication: "நீங்கள் எந்த மருந்தையும் எடுக்கவில்லை என்றால், இந்த ஓவர்-தி-கவுண்டர் விருப்பங்களைப் பரிசீலிக்கலாம்:",
    correctMedication: "நீங்கள் {0} எடுத்ததாக குறிப்பிட்டுள்ளீர்கள். இது உங்கள் அறிகுறிகளுக்கு ஏற்ற மருந்தாகும்.",
    incorrectMedication: "நீங்கள் குறிப்பிட்ட மருந்து ({0}) உங்கள் அறிகுறிகளுக்கு மிகவும் பொருத்தமானதாக இருக்காது. இங்கே சில மிகவும் பொருத்தமான விருப்பங்கள் உள்ளன:",
    clearChat: "அரட்டையை அழி",
    disclaimer: "இந்த சாட்பாட் MEDICONNECT நபர்களால் உருவாக்கப்பட்டது ...",
    greeting: "வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    thankYou: "வரவேற்கிறோம்!!!"
  }
};


const medicalQA = {
  english: {
    
      "headache": {
        "remedies": [
          "Rest in a quiet, dark room",
          "Apply a cold or warm compress to your head",
          "Stay hydrated",
          "Practice relaxation techniques"
        ],
        "medications": [
          { "name": "Acetaminophen (Tylenol)", "dosage": "1-2 tablets every 4-6 hours (as needed)" },
          { "name": "Ibuprofen (Advil, Motrin)", "dosage": "1-2 tablets every 4-6 hours (as needed)" },
          { "name": "Aspirin", "dosage": "1-2 tablets every 4 hours (as needed)" }
        ]
      },
      "fever": {
        "remedies": [
          "Rest and get plenty of sleep",
          "Stay hydrated (water, clear broths, herbal teas)",
          "Dress in lightweight clothing",
          "Use a fan or air conditioner to keep the room cool"
        ],
        "medications": [
          { "name": "Acetaminophen (Tylenol, Paracetamol)", "dosage": "1 tablet in the day, 1 tablet at night" },
          { "name": "Ibuprofen (Advil, Motrin)", "dosage": "1 tablet in the day, 1 tablet at night" }
        ]
      },
      "cough": {
        "remedies": [
          "Stay hydrated (water, herbal teas, warm soups)",
          "Use a humidifier or take a steamy shower",
          "Try honey (for adults and children over 1 year)",
          "Avoid irritants like smoke or strong odors"
        ],
        "medications": [
          { "name": "Dextromethorphan (for dry coughs)", "dosage": "10-20 mg every 4 hours (up to 120 mg/day)" },
          { "name": "Guaifenesin (for productive coughs)", "dosage": "200-400 mg every 4 hours (up to 2.4 g/day)" }
        ]
      },
      "cold": {
        "remedies": [
          "Get plenty of rest",
          "Stay hydrated",
          "Gargle with salt water",
          "Use a saline nasal spray"
        ],
        "medications": [
          { "name": "Decongestants", "dosage": "30 mg every 4-6 hours (up to 240 mg/day)" },
          { "name": "Antihistamines", "dosage": "25-50 mg every 4-6 hours (up to 300 mg/day)" },
          { "name": "Pain relievers (Acetaminophen, Ibuprofen)", "dosage": "1 tablet in the day, 1 tablet at night" }
        ]
      },
      "diabetes": {
        "remedies": [
          "Maintain a healthy diet (low sugar and carbs)",
          "Exercise regularly",
          "Monitor blood sugar levels",
          "Stay hydrated"
        ],
        "medications": [
          { "name": "Metformin (Glucophage)", "dosage": "500 mg to 1 g twice a day" },
          { "name": "Insulin therapy (for type 1 and some type 2 diabetes patients)", "dosage": "Dosage depends on blood sugar levels and doctor’s instructions" },
          { "name": "SGLT2 inhibitors (Dapagliflozin, Empagliflozin)", "dosage": "5-10 mg once daily" }
        ]
      },
      "sore throat": {
         "remedies": [
          "Gargle with warm salt water",
          "Stay hydrated with warm fluids like tea and honey",
          "Use throat lozenges or hard candy",
          "Rest your voice and avoid irritants like smoke",
          "Use a humidifier to keep the air moist"
       ],
      "medications": [
        { "name": "Pain relievers (Ibuprofen, Acetaminophen)", "dosage": "200-400 mg every 4-6 hours as needed" },
        { "name": "Throat sprays (Benzocaine, Phenol)", "dosage": "Use as directed every 2-4 hours" },
        { "name": "Antibiotics (Amoxicillin, Azithromycin) - only if bacterial infection like strep throat is confirmed", "dosage": "Amoxicillin 500 mg every 8 hours for 10 days" }
       ]
      },
        "asthma": {
          "remedies": [
            "Avoid allergens and irritants",
            "Use a humidifier in dry conditions",
            "Practice breathing exercises",
            "Maintain a healthy weight"
          ],
          "medications": [
            { "name": "Inhaled corticosteroids (Budesonide, Fluticasone)", "dosage": "1-2 puffs twice a day" },
            { "name": "Bronchodilators (Albuterol, Salbutamol)", "dosage": "1-2 puffs every 4-6 hours as needed" },
            { "name": "Leukotriene modifiers (Montelukast, Zafirlukast)", "dosage": "10 mg once daily" }
          ]
        },
        "food poisoning": {
          "remedies": [
            "Stay hydrated by drinking plenty of fluids",
            "Consume electrolyte-rich solutions",
            "Eat bland foods like bananas, rice, toast",
            "Rest to allow the body to recover"
          ],
          "medications": [
            { "name": "Oral Rehydration Solution (ORS)", "dosage": "As needed to prevent dehydration" },
            { "name": "Antidiarrheal drugs (Loperamide)", "dosage": "4 mg initially, then 2 mg after each loose stool" },
            { "name": "Antibiotics (Ciprofloxacin, Azithromycin)", "dosage": "As prescribed by doctor (only if bacterial infection is confirmed)" }
          ]
        },
        "dengue": {
          "remedies": [
            "Drink plenty of fluids to stay hydrated",
            "Get enough rest and avoid exertion",
            "Use mosquito repellents and wear protective clothing",
            "Consume papaya leaf extract to help increase platelet count"
          ],
          "medications": [
            { "name": "Electrolyte solutions", "dosage": "As needed to maintain hydration" },
            { "name": "Avoid NSAIDs (Aspirin, Ibuprofen)", "dosage": "Not recommended due to risk of bleeding" }
          ]
        },
        "loose motion": {
          "remedies": [
            "Drink plenty of fluids, including ORS",
            "Eat a bland diet (bananas, rice, toast, yogurt)",
            "Avoid dairy, spicy, and fatty foods",
            "Maintain proper hygiene to prevent infection"
          ],
          "medications": [
            { "name": "Oral Rehydration Solution (ORS)", "dosage": "As needed to prevent dehydration" },
            { "name": "Loperamide", "dosage": "4 mg initially, then 2 mg after each loose stool (max 16 mg/day)" },
            { "name": "Probiotics", "dosage": "As directed to restore gut flora" }
          ]
        }
      },
      
    
  hindi: {
    "सिरदर्द": {
      remedies: [
        "शांत, अंधेरे कमरे में आराम करें",
        "अपने सिर पर ठंडा या गर्म कंप्रेस लगाएं",
        "पर्याप्त पानी पीएं",
        "आराम की तकनीकों का अभ्यास करें"
      ],
      medications: [
        "एसिटामिनोफेन (टायलेनॉल)",
        "आइबुप्रोफेन (एडविल, मोट्रिन)",
        "एस्पिरिन"
      ]
    },
    "बुखार": {
      remedies: [
        "आराम करें और पर्याप्त नींद लें",
        "पर्याप्त पानी पीएं (पानी, साफ शोरबा, जड़ी बूटी की चाय)",
        "हल्के कपड़े पहनें",
        "कमरे को ठंडा रखने के लिए पंखे या एयर कंडीशनर का उपयोग करें"
      ],
      medications: [
        "एसिटामिनोफेन (टायलेनॉल, पैरासिटामोल)",
        "आइबुप्रोफेन (एडविल, मोट्रिन)"
      ]
    },
    "खांसी": {
      remedies: [
        "पर्याप्त पानी पीएं (पानी, जड़ी बूटी की चाय, गर्म सूप)",
        "ह्यूमिडिफायर का उपयोग करें या भाप वाला शावर लें",
        "शहद का प्रयोग करें (वयस्कों और 1 वर्ष से अधिक उम्र के बच्चों के लिए)",
        "धुएं या तेज गंध जैसे उत्तेजकों से बचें"
      ],
      medications: [
        "डेक्स्ट्रोमेथोर्फन (सूखी खांसी के लिए)",
        "ग्वाइफेनेसिन (उत्पादक खांसी के लिए)"
      ]
    },
    "सर्दी": {
      remedies: [
        "पर्याप्त आराम करें",
        "पर्याप्त पानी पीएं",
        "नमक के पानी से गरारे करें",
        "सेलाइन नेजल स्प्रे का उपयोग करें"
      ],
      medications: [
        "डीकंजेस्टेंट्स",
        "एंटीहिस्टामाइन्स",
        "दर्द निवारक (एसिटामिनोफेन, आइबुप्रोफेन)"
      ]
    }
  },
  marathi: {
    "डोकेदुखी": {
      remedies: [
        "शांत, अंधाऱ्या खोलीत विश्रांती घ्या",
        "डोक्यावर थंड किंवा गरम कंप्रेस लावा",
        "भरपूर पाणी प्या",
        "विश्रांती तंत्रांचा सराव करा"
      ],
      medications: [
        "अॅसिटामिनोफेन (टायलेनॉल)",
        "आयबुप्रोफेन (अॅडविल, मोट्रिन)",
        "अॅस्पिरिन"
      ]
    },
    "ताप": {
      remedies: [
        "विश्रांती घ्या आणि पुरेशी झोप घ्या",
        "भरपूर पाणी प्या (पाणी, स्वच्छ ब्रॉथ, औषधी चहा)",
        "हलके कपडे घाला",
        "खोली थंड ठेवण्यासाठी पंखा किंवा एसी वापरा"
      ],
      medications: [
        "अॅसिटामिनोफेन (टायलेनॉल, पॅरासिटामोल)",
        "आयबुप्रोफेन (अॅडविल, मोट्रिन)"
      ]
    },
    "खोकला": {
      remedies: [
        "भरपूर पाणी प्या (पाणी, औषधी चहा, गरम सूप)",
        "ह्यूमिडिफायर वापरा किंवा वाफारी शॉवर घ्या",
        "मिठाच्या पाण्याने गुळण्या करा",
        "धूर किंवा तीव्र गंधासारख्या उत्तेजकांपासून दूर राहा"
      ],
      medications: [
        "डेक्स्ट्रोमेथॉर्फन (कोरडे खोकला)",
        "ग्वाइफेनेसिन (उत्पादक खोकला)"
      ]
    },
    "सर्दी": {
      remedies: [
        "पुरेशी विश्रांती घ्या",
        "भरपूर पाणी प्या",
        "मीठाच्या पाण्याने गुळण्या करा",
        "सेलाइन नासिक स्प्रे वापरा"
      ],
      medications: [
        "डीकंजेस्टंट्स",
        "अँटिहिस्टामाइन",
        "दर्दनिवारक (अॅसिटामिनोफेन, आयबुप्रोफेन)"
      ]
    }
  },
  punjabi : {
    "ਸਿਰਦਰਦ": {
      remedies: [
        "ਇੱਕ ਸ਼ਾਂਤ, ਹਨੇਰੇ ਕਮਰੇ ਵਿੱਚ ਆਰਾਮ ਕਰੋ",
        "ਆਪਣੇ ਸਿਰ 'ਤੇ ਠੰਡਾ ਜਾਂ ਗਰਮ ਕੰਪ੍ਰੈਸ ਲਗਾਓ",
        "ਖੂਬ ਪਾਣੀ ਪੀਓ",
        "ਰਿਲੈਕਸੇਸ਼ਨ ਤਕਨੀਕਾਂ ਦਾ ਅਭਿਆਸ ਕਰੋ"
      ],
      medications: [
        "ਐਸੀਟਾਮਿਨੋਫੇਨ (ਟਾਇਲੇਨੋਲ)",
        "ਆਈਬੂਪ੍ਰੋਫੇਨ (ਐਡਵਿਲ, ਮੋਟਰਿਨ)",
        "ਐਸਪਿਰਿਨ"
      ]
    },
    "ਬੁਖਾਰ": {
      remedies: [
        "ਆਰਾਮ ਕਰੋ ਅਤੇ ਭਰਪੂਰ ਨੀਂਦ ਲਓ",
        "ਖੂਬ ਪਾਣੀ ਪੀਓ (ਪਾਣੀ, ਸਾਫ਼ ਸ਼ੋਰਬਾ, ਹਰਬਲ ਚਾਹ)",
        "ਹਲਕੇ ਕੱਪੜੇ ਪਹਿਨੋ",
        "ਕਮਰੇ ਨੂੰ ਠੰਡਾ ਰੱਖਣ ਲਈ ਪੰਖਾ ਜਾਂ ਏਅਰ ਕੰਡੀਸ਼ਨਰ ਦੀ ਵਰਤੋਂ ਕਰੋ"
      ],
      medications: [
        "ਐਸੀਟਾਮਿਨੋਫੇਨ (ਟਾਇਲੇਨੋਲ, ਪੈਰਾਸੀਟਾਮੋਲ)",
        "ਆਈਬੂਪ੍ਰੋਫੇਨ (ਐਡਵਿਲ, ਮੋਟਰਿਨ)"
      ]
    },
    "ਖਾਂਸੀ": {
      remedies: [
        "ਖੂਬ ਪਾਣੀ ਪੀਓ (ਪਾਣੀ, ਹਰਬਲ ਚਾਹ, ਗਰਮ ਸੂਪ)",
        "ਹਿਊਮਿਡੀਫਾਇਰ ਦੀ ਵਰਤੋਂ ਕਰੋ ਜਾਂ ਭਾਫ ਵਾਲਾ ਸ਼ਾਵਰ ਲਓ",
        "ਸ਼ਹਿਦ ਦੀ ਵਰਤੋਂ ਕਰੋ (ਬਾਲਗਾਂ ਅਤੇ 1 ਸਾਲ ਤੋਂ ਵੱਧ ਉਮਰ ਦੇ ਬੱਚਿਆਂ ਲਈ)",
        "ਧੂੰਏਂ ਜਾਂ ਤਿੱਖੀ ਗੰਧ ਵਰਗੇ ਉਤੇਜਕਾਂ ਤੋਂ ਬਚੋ"
      ],
      medications: [
        "ਡੈਕਸਟ੍ਰੋਮੈਥੋਰਫਨ (ਸੁੱਕੀ ਖਾਂਸੀ ਲਈ)",
        "ਗੁਆਇਫੇਨੇਸਿਨ (ਪ੍ਰੋਡਕਟਿਵ ਖਾਂਸੀ ਲਈ)"
      ]
    },
    "ਜ਼ੁਕਾਮ": {
      remedies: [
        "ਭਰਪੂਰ ਆਰਾਮ ਕਰੋ",
        "ਖੂਬ ਪਾਣੀ ਪੀਓ",
        "ਨਮਕ ਦੇ ਪਾਣੀ ਨਾਲ ਗਰਾਰੇ ਕਰੋ",
        "ਸਲਾਈਨ ਨੇਜ਼ਲ ਸਪ੍ਰੇ ਦੀ ਵਰਤੋਂ ਕਰੋ"
      ],
      medications: [
        "ਡੀਕੰਜੇਸਟੈਂਟਸ",
        "ਐਂਟੀਹਿਸਟਾਮਾਈਨਸ",
        "ਦਰਦ ਨਿਵਾਰਕ (ਐਸੀਟਾਮਿਨੋਫੇਨ, ਆਈਬੂਪ੍ਰੋਫੇਨ)"
      ]
    }
  },  
  tamil : {
    "தலைவலி": {
      remedies: [
        "அமைதியான, இருட்டான அறையில் ஓய்வெடுக்கவும்",
        "உங்கள் தலையில் குளிர் அல்லது சூடான கம்ப்ரஸ் வைக்கவும்",
        "நிறைய தண்ணீர் குடிக்கவும்",
        "ஓய்வு நுட்பங்களை பயிற்சி செய்யவும்"
      ],
      medications: [
        "அசிட்டமினோஃபென் (டைலினால்)",
        "ஐப்யூப்ரோஃபென் (அட்வில், மோட்ரின்)",
        "ஆஸ்பிரின்"
      ]
    },
    "காய்ச்சல்": {
      remedies: [
        "ஓய்வெடுத்து போதுமான தூக்கம் பெறவும்",
        "நிறைய தண்ணீர் குடிக்கவும் (தண்ணீர், தெளிவான குழம்புகள், மூலிகை தேநீர்)",
        "இலகுவான ஆடைகளை அணியவும்",
        "அறையை குளிராக வைத்திருக்க விசிறி அல்லது ஏர் கண்டிஷனர் பயன்படுத்தவும்"
      ],
      medications: [
        "அசிட்டமினோஃபென் (டைலினால், பாராசிட்டமோல்)",
        "ஐப்யூப்ரோஃபென் (அட்வில், மோட்ரின்)"
      ]
    },
    "இருமல்": {
      remedies: [
        "நிறைய தண்ணீர் குடிக்கவும் (தண்ணீர், மூலிகை தேநீர், சூடான சூப்)",
        "ஈரப்பதமாக்கி பயன்படுத்தவும் அல்லது நீராவி ஷவர் எடுக்கவும்",
        "தேன் பயன்படுத்தவும் (வயது வந்தோர் மற்றும் 1 வயதுக்கு மேற்பட்ட குழந்தைகளுக்கு)",
        "புகை அல்லது கடுமையான வாசனைகளை தவிர்க்கவும்"
      ],
      medications: [
        "டெக்ஸ்ட்ரோமெத்தார்பன் (உலர் இருமல்)",
        "குவைஃபெனெசின் (உற்பத்தி இருமல்)"
      ]
    },
    "சளி": {
      remedies: [
        "போதுமான ஓய்வு எடுக்கவும்",
        "நிறைய தண்ணீர் குடிக்கவும்",
        "உப்பு நீரால் கழுவவும்",
        "சாலைன் நாசி ஸ்ப்ரே பயன்படுத்தவும்"
      ],
      medications: [
        "டிகான்ஜெஸ்டன்ட்ஸ்",
        "ஆன்டிஹிஸ்டமைன்கள்",
        "வலி நிவாரணிகள் (அசிட்டமினோஃபென், ஐப்யூப்ரோஃபென்)"
      ]
    }
  }
}
  

const MEDICONNECTChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("english");
  const [currentSymptom, setCurrentSymptom] = useState(null);
  const [currentRemedies, setCurrentRemedies] = useState(null);
  const [conversationStage, setConversationStage] = useState("initial");
  const [currentMedication, setCurrentMedication] = useState(null);
  const [prescription, setPrescription] = useState([]);
  const [prescriptionEnable, setPrescriptionEnable] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [username, setUsername] = useState("");
  const [welcomeShown, setWelcomeShown] = useState(false);

  // Initialize chat with welcome message
  useEffect(() => {
    // Check if user is authenticated
    const sessionUsername = sessionStorage.getItem("username");
    const isAuthenticated = sessionStorage.getItem("authenticated") === "true";
    const localUser = localStorage.getItem("user");
    
    let currentUsername = "User";
    
    if (sessionUsername && isAuthenticated) {
      currentUsername = sessionUsername;
    } else if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        currentUsername = userData.username || "User";
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    setUsername(currentUsername);
    
    // Add welcome message as the first message
    if (!welcomeShown) {
      const welcomeMessage = {
        text: `Welcome, ${currentUsername}! 👋 How can I assist you with your health concerns today?`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      
      setMessages([welcomeMessage]);
      setWelcomeShown(true);
    }
    
  }, [welcomeShown]);

  // Auto scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get current time for message timestamp
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const findSymptom = (question) => {
    const lowerQuestion = question.toLowerCase()
    const qaSet = medicalQA[language]
    for (const key of Object.keys(qaSet)) {
      if (lowerQuestion.includes(key.toLowerCase())) {
        return key
      }
    }
    return null
  }


  const getResponse = (symptom, duration, tookMedicine, medicineTaken) => {
    const { remedies, medications } = medicalQA[language][symptom];
    console.log(medications);
    let response = `You've been experiencing ${symptom} for ${duration}.\n`;

    response += `Here are some remedies you can try:\n`;
    response += remedies.map((remedy ,  index) => `${index + 1} ${remedy}\n`) + "\n" ;
    console.log(response);

    setCurrentRemedies(remedies);

    if (!tookMedicine) {
        response += `The medication you mentioned may not be the most appropriate for your symptoms.\n`;
        response += `Here are some suitable options:\n`;
        response += medications.map((medication, index) => {
            const { name, dosage } = medication; // Assuming each medication has a `name` and `dosage` field
            return `${index + 1} ${name} - Dosage: ${dosage}`;
        }).join("\n") + "\n";
        response += `Have you taken any medication? If yes, please let me know the name and dosage.`;
        setCurrentMedication(medications);
    } else if (medicineTaken) {
        const isCorrectMedication = medications.some(med =>
            medicineTaken.toLowerCase().includes(med.name.toLowerCase())
        );

        if (isCorrectMedication)
           {
            const correctMed = medications.find(med =>
                medicineTaken.toLowerCase().includes(med.name.toLowerCase())
            );
            response += `You have taken the correct medication (${medicineTaken}).\n`;
            response += `Dosage: ${correctMed.dosage}\n`;
            setCurrentMedication(medications);
        } else {
          
            response += `The medication you mentioned (${medicineTaken}) may not be the most appropriate for your symptoms.\n`;
            response += `Here are some suitable options:\n`;
            response += medications.map((medication, index) => {
                const { name, dosage } = medication;
                return `${index + 1}. ${name} - Dosage: ${dosage}`;
            }).join("\n") + "\n";
            console.log(medications);
            setCurrentMedication(medications);
        }
    }

    // Add proper line breaks after each full stop
    response = response
        .replace(/\. /g, '.\n') // Replace '. ' with '.\n' (space followed by a full stop)
        .replace(/\.\n\n/g, '.\n') // Remove extra blank lines introduced after a period
        .replace(/\.\n$/, '.'); // Avoid an extra newline at the end if the text ends with a period

    return response.trim();
};


  const simulateTyping = (botResponse) => {
    setIsTyping(true);
    // Simulate typing delay based on message length (minimum 1s, maximum 3s)
    const typingTime = Math.min(Math.max(botResponse.text.length * 20, 1000), 3000);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { ...botResponse, time: getCurrentTime() }]);
    }, typingTime);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage = { text: input, sender: "user", time: getCurrentTime() };
    setMessages(prev => [...prev, userMessage]);
    
    let botResponse;
    
    const lowerInput = input.toLowerCase()
    if (
      lowerInput === "hello" || 
      lowerInput === "hi" || 
      lowerInput === "Hie" ||
      lowerInput === "नमस्ते" || 
      lowerInput === "नमस्कार" 
    ) {
      botResponse = { text: languages[language].greeting, sender: "bot" }
    } else if (
      lowerInput === "thank you" || 
      lowerInput === "thanks" ||
      lowerInput === "धन्यवाद" || // Hindi
      lowerInput === "आभार" // Marathi
    ) {
      botResponse = { text: languages[language].thankYou, sender: "bot" }
      const tempPrescription = {
        currentSymptom,
        currentRemedies,
        currentMedication
      }
      window.localStorage.setItem("prescription", JSON.stringify(tempPrescription));
      setPrescriptionEnable(true)
    } else {
      switch (conversationStage) {
        case "initial":
          const symptom = findSymptom(input)
          if (symptom) {
            setCurrentSymptom(symptom)
            botResponse = { text: languages[language].askDuration, sender: "bot" }
            setConversationStage("askingDuration")
          } else {
            botResponse = { text: languages[language].notFound, sender: "bot" }
            setConversationStage("initial")
          }
          break
        case "askingDuration":
          botResponse = { text: languages[language].askMedicine, sender: "bot" }
          setConversationStage("askingMedicine")
          break
        case "askingMedicine":
          const tookMedicine = input.toLowerCase().includes("yes") || 
                               input.toLowerCase().includes("हां") || // Hindi
                               input.toLowerCase().includes("होय") // Marathi
          if (tookMedicine) {
            botResponse = { text: languages[language].askWhichMedicine, sender: "bot" }
            setConversationStage("askingWhichMedicine")
          } else {
            botResponse = { text: getResponse(currentSymptom, messages[messages.length - 2].text, false, null), sender: "bot" }
            setConversationStage("initial")
            // setCurrentSymptom(null)
          }
          break
        case "askingWhichMedicine":
          botResponse = { text: getResponse(currentSymptom, messages[messages.length - 4].text, true, input), sender: "bot" }
          setConversationStage("initial")
          // setCurrentSymptom(null)
          break
        default:
          botResponse = { text: languages[language].notFound, sender: "bot" }
          setConversationStage("initial")
      }
    }
    
    // Instead of immediately adding bot response, simulate typing
    simulateTyping(botResponse);
    setInput("");
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setIsTyping(true);
    
    // Brief delay to simulate loading the new language
    setTimeout(() => {
      setIsTyping(false);
      setMessages([{ text: languages[newLanguage].welcome, sender: "bot", time: getCurrentTime() }]);
      setCurrentSymptom(null);
      setConversationStage("initial");
    }, 1000);
  };

  const handleClearChat = () => {
    // Add fade-out animation
    const messageElements = document.querySelectorAll('.message');
    messageElements.forEach((el, i) => {
      el.style.animation = `fadeOut 0.3s forwards ${i * 0.05}s`;
    });
    
    // Wait for animations to complete before clearing
    setTimeout(() => {
      setMessages([{ text: languages[language].welcome, sender: "bot", time: getCurrentTime() }]);
      setCurrentSymptom(null);
      setConversationStage("initial");
    }, messageElements.length * 50 + 300);
  };

  return (
    <>
      <div className="container">
        <div className="header">
          <h2 className="title">MEDICONNECT</h2>
          <div className="language-controls">
            <select 
              className="language-select"
              onChange={(e) => handleLanguageChange(e.target.value)} 
              defaultValue={language}
            >
              <option value="english">English</option>
              <option value="hindi">हिंदी</option>
              <option value="marathi">मराठी</option>
              <option value="punjabi">ਪੰਜਾਬੀ</option>
              <option value="tamil">தமிழ்</option>
            </select>
            <button 
              onClick={handleClearChat} 
              className="clear-button" 
              aria-label={languages[language].clearChat}
            >
              <Trash2 size={16} className="icon" />
            </button>
          </div>
        </div>

        <div className="messages">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender === "user" ? "user" : "admin"}`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={`message-bubble ${message.sender === "user" ? "user-bubble" : "admin-bubble"}`}>
                {message.text.split('\n').map((line, i) => (
                  <p key={i} className="message-line">{line}</p>
                ))}
              </div>
              <div className="message-time">{message.time}</div>
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-group">
          <input
            type="text"
            placeholder={languages[language].placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={languages[language].placeholder}
            className="input"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            className="send-button" 
            aria-label="Send message"
            disabled={isTyping || input.trim() === ""}
          >
            <Send size={20} className="icon" />
            <span className="sr-only">Send</span>
          </button>
        </div>
      </form>
      
      {prescriptionEnable && 
        <div>
          <Prescription symptoms={currentSymptom} remedies={currentRemedies} medications={currentMedication} />
        </div>
      }
      
      <div>
        {currentSymptom && <VideoRecommendations symptom={currentSymptom} />}
      </div>
    </>
  );
};

export default MEDICONNECTChatbot;
