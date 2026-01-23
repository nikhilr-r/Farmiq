
const officers = [
    // 1. Pune
    { name: "Shri. Rajesh Patil", designation: "District Superintending Agriculture Officer", level: "DISTRICT", location: { district: "Pune", taluka: "Pune City" }, contact: { phone: "020-25534321", email: "dsao.pune@gov.in", workingHours: "10-6 PM", officeAddress: "Krishi Bhavan, Shivaji Nagar, Pune" } },
    { name: "Smt. Sunita Deshmukh", designation: "Taluka Agriculture Officer (TAO)", level: "TALUKA", location: { district: "Pune", taluka: "Haveli" }, contact: { phone: "020-25441122", workingHours: "10-5 PM", officeAddress: "Panchayat Samiti, Haveli" } },
    { name: "Shri. Ramesh Jadhav", designation: "Taluka Agriculture Officer (TAO)", level: "TALUKA", location: { district: "Pune", taluka: "Baramati" }, contact: { phone: "02112-223344", workingHours: "10-5 PM", officeAddress: "Administrative Building, Baramati" } },
    { name: "Shri. Vinod Shinde", designation: "Taluka Agriculture Officer (TAO)", level: "TALUKA", location: { district: "Pune", taluka: "Junnar" }, contact: { phone: "02132-222333", workingHours: "10-5 PM", officeAddress: "Panchayat Samiti, Junnar" } },
    // 2. Nashik
    { name: "Shri. Anil Kadam", designation: "DSAO Nashik", level: "DISTRICT", location: { district: "Nashik", taluka: "Nashik" }, contact: { phone: "0253-2233445", email: "dsao.nashik@gov.in", workingHours: "10-6 PM", officeAddress: "Near CBS, Nashik" } },
    { name: "Mr. Deepak Shinde", designation: "Taluka Agriculture Officer", level: "TALUKA", location: { district: "Nashik", taluka: "Niphad" }, contact: { phone: "02550-222333", workingHours: "10-5 PM", officeAddress: "Panchayat Samiti, Niphad" } },
    { name: "Mrs. Kavita More", designation: "Taluka Agriculture Officer", level: "TALUKA", location: { district: "Nashik", taluka: "Malegaon" }, contact: { phone: "02554-222444", workingHours: "10-5 PM", officeAddress: "Panchayat Samiti, Malegaon" } },
    // 3. Dhule
    { name: "Shri. Kiran More", designation: "DSAO Dhule", level: "DISTRICT", location: { district: "Dhule", taluka: "Dhule" }, contact: { phone: "02562-288299", email: "dsao.dhule@gov.in", workingHours: "10-6 PM", officeAddress: "Collector Office Compound, Dhule" } },
    { name: "Shri. Vilas Patil", designation: "Taluka Agriculture Officer", level: "TALUKA", location: { district: "Dhule", taluka: "Sakri" }, contact: { phone: "02568-222111", workingHours: "10-5 PM", officeAddress: "Panchayat Samiti, Sakri" } },
    { name: "Shri. Ashok Ahire", designation: "Taluka Agriculture Officer", level: "TALUKA", location: { district: "Dhule", taluka: "Shirpur" }, contact: { phone: "02563-222222", workingHours: "10-5 PM", officeAddress: "Panchayat Samiti, Shirpur" } },
    // 4. Jalgaon
    { name: "Smt. Meera Patil", designation: "DSAO Jalgaon", level: "DISTRICT", location: { district: "Jalgaon", taluka: "Jalgaon" }, contact: { phone: "0257-2233111", email: "dsao.jalgaon@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Suresh Mahajan", designation: "Taluka Agriculture Officer", level: "TALUKA", location: { district: "Jalgaon", taluka: "Bhusawal" }, contact: { phone: "02582-222333", workingHours: "10-5 PM" } },
    // 5. Aurangabad
    { name: "Dr. Vijay Rathod", designation: "DSAO Aurangabad", level: "DISTRICT", location: { district: "Aurangabad", taluka: "Aurangabad" }, contact: { phone: "0240-2334455", email: "dsao.aurangabad@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Ganesh Gaikwad", designation: "Taluka Agriculture Officer", level: "TALUKA", location: { district: "Aurangabad", taluka: "Paithan" }, contact: { phone: "02431-223344", workingHours: "10-5 PM" } },
    // 6. Solapur
    { name: "Shri. Dattatray Gite", designation: "DSAO Solapur", level: "DISTRICT", location: { district: "Solapur", taluka: "Solapur" }, contact: { phone: "0217-2312121", email: "dsao.solapur@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Mohan Kale", designation: "Taluka Agriculture Officer", level: "TALUKA", location: { district: "Solapur", taluka: "Pandharpur" }, contact: { phone: "02186-222333", workingHours: "10-5 PM" } },
    // Others (Condensed but included)
    { name: "Smt. Linda Thomas", designation: "DSAO Nagpur", level: "DISTRICT", location: { district: "Nagpur", taluka: "Nagpur" }, contact: { phone: "0712-2567890", email: "dsao.nagpur@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Pratap Chavan", designation: "DSAO Satara", level: "DISTRICT", location: { district: "Satara", taluka: "Satara" }, contact: { phone: "02162-234567", email: "dsao.satara@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Suresh Dhule", designation: "DSAO Amravati", level: "DISTRICT", location: { district: "Amravati", taluka: "Amravati" }, contact: { phone: "0721-2662121", email: "dsao.amravati@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Ramesh Bhil", designation: "DSAO Nandurbar", level: "DISTRICT", location: { district: "Nandurbar", taluka: "Nandurbar" }, contact: { phone: "02564-221234", email: "dsao.nandurbar@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Ajay Pawar", designation: "DSAO Kolhapur", level: "DISTRICT", location: { district: "Kolhapur", taluka: "Karvir" }, contact: { phone: "0231-2655555", email: "dsao.kolhapur@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Vilas Nalawade", designation: "DSAO Ahmednagar", level: "DISTRICT", location: { district: "Ahmednagar", taluka: "Nagar" }, contact: { phone: "0241-2345678", email: "dsao.ahmednagar@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Pramod Deshmukh", designation: "DSAO Yavatmal", level: "DISTRICT", location: { district: "Yavatmal", taluka: "Yavatmal" }, contact: { phone: "07232-244555", email: "dsao.yavatmal@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Sanjay Kulkarni", designation: "DSAO Buldhana", level: "DISTRICT", location: { district: "Buldhana", taluka: "Buldhana" }, contact: { phone: "07262-242424", email: "dsao.buldhana@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Mahesh Swami", designation: "DSAO Latur", level: "DISTRICT", location: { district: "Latur", taluka: "Latur" }, contact: { phone: "02382-244444", email: "dsao.latur@gov.in", workingHours: "10-6 PM" } },
    { name: "Smt. Rohini Kale", designation: "DSAO Osmanabad", level: "DISTRICT", location: { district: "Osmanabad", taluka: "Osmanabad" }, contact: { phone: "02472-222333", email: "dsao.osmanabad@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Ashok Shinde", designation: "DSAO Beed", level: "DISTRICT", location: { district: "Beed", taluka: "Beed" }, contact: { phone: "02442-222444", email: "dsao.beed@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Ravi Jadhav", designation: "DSAO Nanded", level: "DISTRICT", location: { district: "Nanded", taluka: "Nanded" }, contact: { phone: "02462-233444", email: "dsao.nanded@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Sunil Chavan", designation: "DSAO Parbhani", level: "DISTRICT", location: { district: "Parbhani", taluka: "Parbhani" }, contact: { phone: "02452-222222", email: "dsao.parbhani@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Deepak Joshi", designation: "DSAO Jalna", level: "DISTRICT", location: { district: "Jalna", taluka: "Jalna" }, contact: { phone: "02482-233333", email: "dsao.jalna@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Amit Mane", designation: "DSAO Hingoli", level: "DISTRICT", location: { district: "Hingoli", taluka: "Hingoli" }, contact: { phone: "02456-222000", email: "dsao.hingoli@gov.in", workingHours: "10-6 PM" } },
    { name: "Smt. Jyoti Patil", designation: "DSAO Sangli", level: "DISTRICT", location: { district: "Sangli", taluka: "Miraj" }, contact: { phone: "0233-2333444", email: "dsao.sangli@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Santosh Rane", designation: "DSAO Ratnagiri", level: "DISTRICT", location: { district: "Ratnagiri", taluka: "Ratnagiri" }, contact: { phone: "02352-222444", email: "dsao.ratnagiri@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Vinod Kamble", designation: "DSAO Sindhudurg", level: "DISTRICT", location: { district: "Sindhudurg", taluka: "Oros" }, contact: { phone: "02362-228888", email: "dsao.sindhudurg@gov.in", workingHours: "10-6 PM" } },
    { name: "Smt. Anjali Naik", designation: "DSAO Thane", level: "DISTRICT", location: { district: "Thane", taluka: "Thane" }, contact: { phone: "022-25334455", email: "dsao.thane@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Nitin Bhoir", designation: "DSAO Palghar", level: "DISTRICT", location: { district: "Palghar", taluka: "Palghar" }, contact: { phone: "02525-255555", email: "dsao.palghar@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Manoj Mhatre", designation: "DSAO Raigad", level: "DISTRICT", location: { district: "Raigad", taluka: "Alibag" }, contact: { phone: "02141-222222", email: "dsao.raigad@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Kishor Deshmukh", designation: "DSAO Akola", level: "DISTRICT", location: { district: "Akola", taluka: "Akola" }, contact: { phone: "0724-2433333", email: "dsao.akola@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Gopal Raut", designation: "DSAO Washim", level: "DISTRICT", location: { district: "Washim", taluka: "Washim" }, contact: { phone: "07252-233444", email: "dsao.washim@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Rajesh Wagh", designation: "DSAO Bhandara", level: "DISTRICT", location: { district: "Bhandara", taluka: "Bhandara" }, contact: { phone: "07184-255555", email: "dsao.bhandara@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Amit Bansod", designation: "DSAO Gondia", level: "DISTRICT", location: { district: "Gondia", taluka: "Gondia" }, contact: { phone: "07182-233333", email: "dsao.gondia@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Vijay Tekam", designation: "DSAO Chandrapur", level: "DISTRICT", location: { district: "Chandrapur", taluka: "Chandrapur" }, contact: { phone: "07172-255555", email: "dsao.chandrapur@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Prakash Madavi", designation: "DSAO Gadchiroli", level: "DISTRICT", location: { district: "Gadchiroli", taluka: "Gadchiroli" }, contact: { phone: "07132-222222", email: "dsao.gadchiroli@gov.in", workingHours: "10-6 PM" } },
    { name: "Shri. Satish Kale", designation: "DSAO Wardha", level: "DISTRICT", location: { district: "Wardha", taluka: "Wardha" }, contact: { phone: "07152-244444", email: "dsao.wardha@gov.in", workingHours: "10-6 PM" } },
    { name: "Smt. Priya Sawant", designation: "DSAO Mumbai", level: "DISTRICT", location: { district: "Mumbai City", taluka: "Mumbai" }, contact: { phone: "022-22334455", email: "dsao.mumbaicity@gov.in", workingHours: "10-6 PM" } },
];

module.exports = officers;
