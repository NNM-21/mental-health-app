function checkMood() {
    let mood = document.getElementById("mood").value;
    let response = "";

    if (mood === "sad") {
        response = "I hear you. It's okay to feel sad.";
    } else if (mood === "happy") {
        response = "That's wonderful!";
    } else {
        response = "Thanks for sharing. You are not alone.";
    }

    document.getElementById("response").innerText = response;
}