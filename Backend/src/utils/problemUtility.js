const axios = require("axios");

const getLanguageId=(lang)=>{
    const language={
        "cpp":54,
        "C++":54,
        "java":62 ,
        "Java":62 ,
        "javascript":63,
        "Javascript":63,
        "python":71,
        "Python":71
    }
    console.log(language[lang]);
    return language[lang];
}

const submitBatch = async(submission)=>{
    // const options = {
    //     method:"POST",
    //     url:`http://${process.env.JUDGE0_SERVER}:${process.env.JUDGE0_PORT}/submissions/batch`,
    //     params:{
    //         base64_encoded:false
    //     },
    //     headers:{
    //         "Content-Type":"application/json"
    //     },
    //     data:{
    //         submissions:submission
    //     }
    // }
  const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions: submission
  }
};
    const response = await axios.request(options);
    return response.data;
}

const waiting = async (timer)=>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve(1);
        },timer)
    })
}
const submitToken = async(resultToken)=>{
    // const options = {
    //     method:"GET",
    //     url:`http://${process.env.JUDGE0_SERVER}:${process.env.JUDGE0_PORT}/submissions/batch`,
    //     params:{
    //         tokens:resultToken.join(","),
    //         base64_encoded:false,
    //         fields:"*"
    //     }
    // }
  const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};

    while(true){
        const response = await axios.request(options);
        const submissions = response.data.submissions;

        const isResultObtained = submissions.every((result)=>result.status_id>2);
        if(isResultObtained){
            return submissions;
        }

        await waiting(1000);
    }
}

module.exports = {getLanguageId,submitBatch,submitToken};
