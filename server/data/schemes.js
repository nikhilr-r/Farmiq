
const schemes = [
    // --- MAJOR FINANCIAL AID (आर्थिक सहाय्य) ---
    // 1. Mahatma Phule Karjmukti (Loan Waiver)
    {
        title: { mr: "महात्मा ज्योतिराव फुले शेतकरी कर्जमुक्ती योजना", en: "Mahatma Jyotirao Phule Shetkari Karjmukti Yojana" },
        type: "STATE",
        category: "Loan",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१. शेतकरी ज्यांचे पीक कर्ज १ एप्रिल २०१५ ते ३१ मार्च २०१९ दरम्यान उचलले आहे.\n२. ३० सप्टेंबर २०१९ पर्यंत २ लाख रुपयांपर्यंत थकबाकी आहे.\n३. आधार क्रमांक बँक खात्याशी लिंक असणे आवश्यक आहे.",
            documents: ["आधार कार्ड", "बँक पासबुक (कर्ज खाते)", "७/१२ उतारा (Digital 7/12 Preferred)"],
            benefits: "पात्र शेतकऱ्यांचे २ लाख रुपयांपर्यंतचे मुद्दल व व्याज संपूर्णपणे माफ केले जाईल.",
            applicationProcess: "१. तुमच्या गावातील महा-ई-सेवा केंद्र (CSC) किंवा बँक शाखेत जा.\n२. आधार बायोमेट्रिक प्रमाणीकरण (Thumb Impression) करा.\n३. कर्जमुक्ती यादीत नाव तपासा.",
            lastDate: new Date('2026-03-31'),
            offlineMode: true
        },
        officialSourceUrl: "https://mjpsky.maharashtra.gov.in/",
        isActive: true
    },

    // 2. Namo Shetkari Maha Samman (State PM Kisan Top-up)
    {
        title: { mr: "नमो शेतकरी महासन्मान निधी योजना", en: "Namo Shetkari Maha Samman Nidhi Yojana" },
        type: "STATE",
        category: "Subsidies",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१. जे शेतकरी केंद्र शासनाच्या PM-KISAN योजनेसाठी पात्र आहेत, ते सर्व या योजनेसाठी पात्र आहेत.\n२. महाराष्ट्राचे रहिवासी असणे आवश्यक.",
            documents: ["आधार कार्ड", "बँक खाते (DBT Enabled)", "जमीन रेकॉर्ड (अद्ययावत)"],
            benefits: "केंद्राच्या ६,००० रुपयांव्यतिरिक्त राज्य शासनाकडून वर्षाला ६,००० रुपये (म्हणजेच एकूण १२,००० रुपये प्रतिवर्ष).",
            applicationProcess: "वेगळा अर्ज करण्याची गरज नाही. PM-KISAN लाभार्थ्यांना आपोआप लाभ मिळेल.",
            lastDate: new Date('2026-12-31'),
            offlineMode: false
        },
        officialSourceUrl: "https://agri.maharashtra.gov.in/",
        isActive: true
    },

    // 3. PM KISAN (Central)
    {
        title: { mr: "प्रधानमंत्री किसान सन्मान निधी (PM-KISAN)", en: "Pradhan Mantri Kisan Samman Nidhi" },
        type: "CENTRAL",
        category: "Subsidies",
        applicableDistricts: ["All"],
        details: {
            eligibility: "सर्व जमीनधारक शेतकरी कुटुंबे (पती, पत्नी, अल्पवयीन मुले). (अपवाद: करदाते, निवृत्तीवेतनधारक इ.)",
            documents: ["आधार कार्ड", "बँक खाते", "जमीन रेकॉर्ड"],
            benefits: "वर्षाला ६,००० रुपये (रु. २००० चे ३ हप्ते).",
            applicationProcess: "pmkisan.gov.in पोर्टलवर 'New Farmer Registration' या पर्यायावर क्लिक करा. किंवा CSC केंद्रावर जा.",
            lastDate: new Date('2026-12-31'),
            offlineMode: false
        },
        officialSourceUrl: "https://pmkisan.gov.in/",
        isActive: true
    },

    // --- IRRIGATION & POWER (सिंचन आणि वीज) ---
    // 4. PM Kusum (Solar Pumps)
    {
        title: { mr: "प्रधानमंत्री कुसुम योजना (सौर कृषी पंप)", en: "PM KUSUM Yojana (Solar Pump)" },
        type: "CENTRAL",
        category: "Infrastructure",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१. ज्या शेतकऱ्यांकडे वीज जोडणी नाही.\n२. स्वत:ची जमीन आणि पाण्याच्या स्त्रोताची उपलब्धता (विहीर/बोअरवेल).",
            documents: ["७/१२ उतारा", "आधार कार्ड", "जातीचा दाखला (SC/ST साठी)", "पासपोर्ट फोटो"],
            benefits: "SC/ST साठी ९५% अनुदान, तर जनरल/OBC साठी ९०% अनुदान. ३ HP, ५ HP व ७.५ HP क्षमतेचे सौर पंप.",
            applicationProcess: "महाऊर्जा (MahaUrja) च्या कुसुम पोर्टलवर ऑनलाइन अर्ज करावा लागतो.",
            lastDate: new Date('2026-05-30'),
            offlineMode: false
        },
        officialSourceUrl: "https://kusum.mahaurja.com/",
        isActive: true
    },

    // 5. Magel Tyala Shettale (Farm Pond)
    {
        title: { mr: "मागेल त्याला शेततळे", en: "Magel Tyala Shettale" },
        type: "STATE",
        category: "Infrastructure",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१. शेतकरी असावा, किमान ०.६० हेक्टर जमीन.\n२. जमीन तांत्रिकदृष्ट्या शेततळ्यासाठी योग्य असावी.",
            documents: ["७/१२", "८-अ", "जॉब कार्ड (असल्यास)", "आत्महत्याग्रस्त कुटुंबातील असल्यास पुरावा (प्राधान्य)"],
            benefits: "शेततळे खोदण्यासाठी थेट ५०,००० रुपये (DBT द्वारे) अनुदान.",
            applicationProcess: "महा-ई-सेवा केंद्र किंवा MahaDBT पोर्टल.",
            lastDate: new Date('2026-05-31'),
            offlineMode: true
        },
        officialSourceUrl: "https://egs.mahaonline.gov.in/",
        isActive: true
    },

    // 6. PMKSY (Micro Irrigation)
    {
        title: { mr: "प्रधानमंत्री कृषी सिंचन योजना (ठिबक/तुषार)", en: "PMKSY - Micro Irrigation Subsidy" },
        type: "CENTRAL",
        category: "Infrastructure",
        applicableDistricts: ["All"],
        details: {
            eligibility: "स्वत:ची शेतजमीन आणि पाण्याची सोय असणारे सर्व शेतकरी.",
            documents: ["७/१२", "८-अ", "आधार कार्ड", "विहीर/बोअरवेल असल्याचा पुरावा", "पूर्वसंमती पत्र"],
            benefits: "अल्प व अत्यल्प भूधारकांसाठी ५५% अनुदान, इतर शेतकऱ्यांसाठी ४५% अनुदान (ठिबक व तुषार संच).",
            applicationProcess: "MahaDBT पोर्टलवर 'Per Drop More Crop' अंतर्गत अर्ज करावा.",
            lastDate: new Date('2026-12-31'),
            offlineMode: false
        },
        officialSourceUrl: "https://mahadbt.maharashtra.gov.in/",
        isActive: true
    },

    // --- SOCIAL WELFARE (सामाजिक न्याय व विशेष सहाय्य) ---
    // 7. Birsa Munda Krishi Kranti (Tribal)
    {
        title: { mr: "बिरसा मुंडा कृषी क्रांती योजना (ST)", en: "Birsa Munda Krishi Kranti Yojana" },
        type: "STATE",
        category: "Social Welfare",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१. फक्त अनुसूचित जमाती (ST) प्रवर्गातील शेतकऱ्यांसाठी.\n२. जातीचा दाखला आवश्यक.\n३. वार्षिक उत्पन्न १.५ लाखाच्या आत.",
            documents: ["जातीचा दाखला", "उत्पन्नाचा दाखला", "७/१२", "आधार कार्ड"],
            benefits: "नवीन विहीर (२.५ लाख), जुनी विहीर दुरुस्ती, पंप संच, पाईपलाईन, आणि वीज जोडणीसाठी १००% अनुदान.",
            applicationProcess: "समाज कल्याण विभाग किंवा कृषी विभागाच्या वेबसाइटवर किंवा MahaDBT पोर्टलवर अर्ज करावा.",
            lastDate: new Date('2026-08-15'),
            offlineMode: true
        },
        officialSourceUrl: "https://mahadbt.maharashtra.gov.in/",
        isActive: true
    },

    // 8. Dr. Babasaheb Ambedkar Krushi Swavalamban (SC)
    {
        title: { mr: "डॉ. बाबासाहेब आंबेडकर कृषी स्वावलंबन योजना (SC)", en: "Dr. Babasaheb Ambedkar Krushi Swavalamban Yojana" },
        type: "STATE",
        category: "Social Welfare",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१. फक्त अनुसूचित जाती (SC) आणि नवबौद्ध शेतकऱ्यांसाठी.\n२. वार्षिक उत्पन्न १.५ लाखाच्या आत.",
            documents: ["जातीचा दाखला", "उत्पन्नाचा दाखला", "७/१२", "आधार कार्ड"],
            benefits: "नवीन विहीर (२.५ लाख), इनवेल बोअरिंग, पंप संच यासाठी अनुदान.",
            applicationProcess: "MahaDBT पोर्टलवर स्वतंत्र टॅब अंतर्गत अर्ज करावा.",
            lastDate: new Date('2026-08-15'),
            offlineMode: true
        },
        officialSourceUrl: "https://mahadbt.maharashtra.gov.in/",
        isActive: true
    },

    // --- INFRASTRUCTURE & HORTICULTURE ---
    // 9. Bhausaheb Fundkar Falbag (Orchards)
    {
        title: { mr: "भाऊसाहेब फुंडकर फळबाग लागवड योजना", en: "Bhausaheb Fundkar Falbag Lagvad Yojana" },
        type: "STATE",
        category: "Horticulture",
        applicableDistricts: ["All"],
        details: {
            eligibility: "कोकण वगळता राज्यातील इतर विभागातील शेतकरी. महात्मा गांधी नरेगा अंतर्गत लाभ न घेऊ शकणारे शेतकरी.",
            documents: ["७/१२", "आधार कार्ड", "हमीपत्र"],
            benefits: "आंबा, डाळिंब, काजू, पेरू, सीताफळ इ. १५ फळपिकांच्या लागवडीसाठी १००% अनुदान (३ वर्षांत टप्प्याटप्प्याने).",
            applicationProcess: "MahaDBT पोर्टलवर 'Horticulture' विभागांतर्गत अर्ज करावा.",
            lastDate: new Date('2026-07-15'),
            offlineMode: false
        },
        officialSourceUrl: "https://mahadbt.maharashtra.gov.in/",
        isActive: true
    },

    // 10. Onion Storage
    {
        title: { mr: "कांदा चाळ उभारणी अनुदान योजना", en: "Onion Storage Subsidy Scheme" },
        type: "STATE",
        category: "Infrastructure",
        applicableDistricts: ["Nashik", "Pune", "Ahmednagar", "Solapur", "Dhule", "Jalgaon"],
        details: {
            eligibility: "१. अर्जदार स्वतःच्या नावे शेतजमीन असावी.\n२. कांदा पीक पेरा नोंद ७/१२ वर असावी.",
            documents: ["७/१२ व ८-अ उतारा", "कांदा लागवड स्वयंघोषणापत्र", "बँक पासबुक", "जागेचा नकाशा/फोटो", "आधार कार्ड"],
            benefits: "२५ मेट्रिक टन क्षमतेच्या चाळीसाठी ८७,५०० रुपये अनुदान (किंवा खर्चाच्या ५०% जे कमी असेल).",
            applicationProcess: "१. महाडिबीटी (MahaDBT) शेतकरी पोर्टलवर नोंदणी करा (mahadbt.maharashtra.gov.in).\n२. 'कांदा चाळ' घटक निवडून अर्ज करा.",
            lastDate: new Date('2026-06-30'), // Before Monsoon typically
            offlineMode: false
        },
        officialSourceUrl: "https://mahadbt.maharashtra.gov.in/",
        isActive: true
    },

    // 11. Farm Mechanization (Tractor)
    {
        title: { mr: "कृषी यांत्रिकीकरण - ट्रॅक्टर व अवजारे अनुदान", en: "Farm Mechanization - Tractor Subsidy" },
        type: "STATE",
        category: "Infrastructure",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१. कोणत्याही प्रवर्गातील शेतकरी.\n२. कुटुंबातील एकाच व्यक्तीला लाभ.\n३. गेल्या १० वर्षात ट्रॅक्टर अनुदानाचा लाभ घेतला नसावा.",
            documents: ["७/१२", "८-अ", "आधार कार्ड", "कोरा चेक/पासबुक", "कोटेशन (पूर्वसंमती नंतर)"],
            benefits: "अनु. जाती/जमाती व महिला: ५०% अनुदान.\nइतर प्रवर्ग: ४०% अनुदान (कमाल १.२५ लाख रुपये ट्रॅक्टरसाठी).",
            applicationProcess: "MahaDBT पोर्टलवर 'Farm Mechanization' अंतर्गत अर्ज करावा. लॉटरी पद्धतीने निवड होते.",
            lastDate: new Date('2026-12-31'),
            offlineMode: false
        },
        officialSourceUrl: "https://mahadbt.maharashtra.gov.in/",
        isActive: true
    },

    // --- INSURANCE & SAFETY (विमा आणि सुरक्षा) ---
    // 12. Gopinath Munde Accident Insurance
    {
        title: { mr: "गोपीनाथ मुंडे शेतकरी अपघात सुरक्षा सानुग्रह अनुदान योजना", en: "Gopinath Munde Shetkari Apghat Vima Yojana" },
        type: "STATE",
        category: "Insurance",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१० ते ७५ वयोगटातील राज्यातील सर्व खातेदार शेतकरी व त्यांच्या कुटुंबातील १ सदस्य.",
            documents: ["७/१२", "मृत्यू दाखला (असल्यास)", "एफ.आय.आर (FIR) ची प्रत", "विच्छेद अहवाल (PM Report)"],
            benefits: "अपघाती मृत्यू झाल्यास: २ लाख रुपये.\nकायमस्वरूपी अपंगत्व: २ लाख रुपये.\nतात्पुरते अपंगत्व: १ लाख रुपये.",
            applicationProcess: "घटनेनंतर ३० दिवसांच्या आत तालुका कृषी अधिकारी कार्यालयात प्रस्ताव सादर करावा.",
            lastDate: new Date('2029-12-31'), // Ongoing
            offlineMode: true
        },
        officialSourceUrl: "https://agri.maharashtra.gov.in/",
        isActive: true
    },

    // 13. PM Fasal Bima (Insurance)
    {
        title: { mr: "प्रधानमंत्री पीक विमा योजना (PMFBY)", en: "Pradhan Mantri Fasal Bima Yojana" },
        type: "CENTRAL",
        category: "Insurance",
        applicableDistricts: ["All"],
        details: {
            eligibility: "अधिसूचित क्षेत्रातील अधिसूचित पिकांसाठी (खरीप/रब्बी). कर्जदार व बिगर-कर्जदार दोघांसाठी ऐच्छिक.",
            documents: ["७/१२", "पीक पेरा स्वयंघोषणापत्र", "बँक पासबुक", "आधार कार्ड"],
            benefits: "नैसर्गिक आपत्ती (दुष्काळ, अतिवृष्टी, कीड) मुळे नुकसान झाल्यास विमा संरक्षण. शेतकऱ्यांचा वाटा फक्त १ रुपया (महाराष्ट्र राज्य निर्णयानुसार).",
            applicationProcess: "१. आपल्या बँकेत विमा हप्ता भरा.\n२. किंवा pmfby.gov.in वर ऑनलाइन भरा.",
            lastDate: new Date('2026-07-31'),
            offlineMode: true
        },
        officialSourceUrl: "https://pmfby.gov.in/",
        isActive: true
    },

    // --- REGIONAL / SPECIAL (विशेष प्रकल्प) ---
    // 14. PoCRA (Nana Deshmukh)
    {
        title: { mr: "नानाजी देशमुख कृषी संजीवनी प्रकल्प (PoCRA)", en: "Nanaji Deshmukh Krishi Sanjeevani Prakalp (PoCRA)" },
        type: "STATE",
        category: "Regional",
        applicableDistricts: ["Aurangabad", "Beed", "Jalna", "Parbhani", "Hingoli", "Nanded", "Latur", "Osmanabad", "Buldhana", "Akola", "Washim", "Yavatmal", "Amravati", "Wardha", "Jalgaon"],
        details: {
            eligibility: "विदर्भ आणि मराठवाड्यातील १५ निवडक जिल्ह्यांतील अल्प आणि अत्यल्प भूधारक शेतकरी.",
            documents: ["७/१२", "८-अ", "आधार कार्ड"],
            benefits: "शेततळे, ठिबक, विहीर पुनर्भरण, सेड नेट, पॉली हाऊस इत्यादींसाठी डीबीटी द्वारे थेट अनुदान.",
            applicationProcess: "dbt.mahapocra.gov.in पोर्टलवर नोंदणी करणे आवश्यक.",
            lastDate: new Date('2026-03-31'),
            offlineMode: false
        },
        officialSourceUrl: "https://mahapocra.gov.in/",
        isActive: true
    },

    // 15. Interest Subvention (Dr. Panjabrao Deshmukh)
    {
        title: { mr: "डॉ. पंजाबराव देशमुख व्याज सवलत योजना", en: "Dr. Panjabrao Deshmukh Interest Subvention" },
        type: "STATE",
        category: "Loan",
        applicableDistricts: ["All"],
        details: {
            eligibility: "१. पीक कर्ज वेळेत ३१ मार्च पर्यंत परतफेड करणारे शेतकरी.\n२. कमाल ३ लाख रुपयांपर्यंतचे कर्ज.",
            documents: ["पीक कर्ज पासबुक", "परतफेड पावती", "आधार कार्ड"],
            benefits: "केंद्र (३%) + राज्य (३%) मिळून ३ लाख रुपयांपर्यंत ०% व्याजाने कर्ज उपलब्ध.",
            applicationProcess: "आपल्या जिल्हा मध्यवर्ती किंवा राष्ट्रीयकृत बँकेशी संपर्क साधा.",
            lastDate: new Date('2026-03-31'),
            offlineMode: true
        },
        officialSourceUrl: "https://agri.maharashtra.gov.in/",
        isActive: true
    }
];

module.exports = schemes;
