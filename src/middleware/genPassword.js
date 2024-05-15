function generatePassword(length) {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';

    const numLowercase = 1;
    const numUppercase = 1;
    const numNumbers = 1;

    const remainingLength = length - numLowercase - numUppercase - numNumbers;

    let password = '';
    for (let i = 0; i < numLowercase; i++) {
        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    }
    for (let i = 0; i < numUppercase; i++) {
        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    }
    for (let i = 0; i < numNumbers; i++) {
        password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    }

    const characters = lowercaseChars + uppercaseChars + numberChars;
    for (let i = 0; i < remainingLength; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
}