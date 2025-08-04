import axios from "axios";

// const JWT_TOKEN = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImxvZ2luX3VzZXJfa2V5IjoiZmY4ZmJkYTgtNzk5Mi00ODYxLWIzN2YtMTlhZmQ1YTBiNTg2In0.M3bLB8rDENq1Hb1lK-vYuPpWLjPNrDYGuozzvq07ukJFZYeXw2GCMQqjCeNpDnA1RXJp26XYLlIYEm_m9zb6zw'
// const JWT_TOKEN = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImxvZ2luX3VzZXJfa2V5IjoiNGU1MTEzMDktZWYyNi00YTcwLThiMTMtZDAwOWMzNzA0YmU4In0.oPeAZ5dXtGFAYWyenn5vvSEhqPJ6lgl_7sFxiJE-9z7DqHVQluwzpppCFQ-b2afhNBMjal5wwWSRckGmqJlRqA'
const MAX_TIMEOUT = 50000

export const post = async (path: string, data?: any, headers?: any) => {
    try {
        console.log("post resuest start :", `${path}`)

        const response = await axios.create({ timeout: MAX_TIMEOUT }).post(
            path,
            data,
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("post resuest end : ", response.data)

        return response.data;
    } catch (error) {
        console.error('Error in post resuest :', error);
        throw error;
    }
}

export const upload = async (path: string, data: any) => {
    try {
        console.log("upload resuest  start :", `${path}`)

        const response = await axios.create({ timeout: MAX_TIMEOUT }).post(
            path,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        console.log("upload resuest  end : ", response.data)

        return response.data;
    } catch (error) {
        console.error('Error in upload resuest :', error);
        throw error;
    }
}

export const get = async (path: string, data: any) => {
    try {
        console.log("get resuest start :", `${path}`)

        const response = await axios.create({ timeout: MAX_TIMEOUT }).get(
            path, {
            params: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        );
        console.log("get resuest  end : ", response.data)

        return response.data;
    } catch (error) {
        console.error('Error in get resuest :', error);
        throw error;
    }
}