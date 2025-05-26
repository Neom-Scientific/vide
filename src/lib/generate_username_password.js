
export async function generateUsernamePassword(email, name, hospital_name, phone_no) {
    const sources = [email, name, hospital_name, phone_no];
    const usedIndices = new Set();

    // generat a username from the first 4 characters of the hospital name (like Shri Ganga Ram Hospital) SGRH and a random number or if the hospital name is less than 4 characters then use the first 2 characters of the hospital name and a random number(like medanta the medicity) METM
    const words = hospital_name.trim().split(/\s+/);

    let prefix = '';
    if (words.length >= 4) {
      // First letter of first 4 words
      prefix = words.slice(0, 4).map(word => word[0]).join('');
    } else {
      // First 2 letters of each word
      prefix = words.map(word => word.slice(0, 2)).join('');
    }
  
    const randomNum = Math.floor(Math.random() * 900) + 100; // Random 3-digit number

    const username = prefix + randomNum;

    let password = '';

    while (usedIndices.size < sources.length) {
        // Randomly pick an unused source
        let index;
        do {
            index = Math.floor(Math.random() * sources.length);
        } while (usedIndices.has(index));
        usedIndices.add(index);

        const source = sources[index].replace(/\s+/g, ''); // remove spaces
        const length = source.length;
        if (length === 0) continue;

        const count = Math.random() < 0.5 ? 2 : 3;
        const start = Math.floor(Math.random() * (length - count + 1));
        password += source.substring(start, start + count);
    }

    password = password.toLowerCase();

    // const password = hospital_name.slice(0, 3) + phone_no.slice(-4) + Math.floor(Math.random() * 100);
    return { username, password };

}