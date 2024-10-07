import { AuthClient } from "@dfinity/auth-client";
import { backend } from "declarations/backend";

let authClient;
let isAuthenticated = false;

async function init() {
    authClient = await AuthClient.create();
    isAuthenticated = await authClient.isAuthenticated();
    updateUI();
}

async function login() {
    await authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: () => {
            isAuthenticated = true;
            updateUI();
        }
    });
}

function updateUI() {
    const loginButton = document.getElementById("loginButton");
    const createPollSection = document.getElementById("createPollSection");

    if (isAuthenticated) {
        loginButton.textContent = "Logout";
        loginButton.onclick = logout;
        createPollSection.style.display = "block";
        fetchPolls();
    } else {
        loginButton.textContent = "Login";
        loginButton.onclick = login;
        createPollSection.style.display = "none";
    }
}

async function logout() {
    await authClient.logout();
    isAuthenticated = false;
    updateUI();
}

async function createPoll(event) {
    event.preventDefault();
    const question = document.getElementById("question").value;
    const options = document.getElementById("options").value.split(",").map(option => option.trim());
    const duration = parseInt(document.getElementById("duration").value);

    try {
        const result = await backend.create_poll({ question, options, duration });
        if ("ok" in result) {
            alert("Poll created successfully!");
            fetchPolls();
        } else {
            alert("Failed to create poll: " + result.err);
        }
    } catch (error) {
        console.error("Error creating poll:", error);
        alert("An error occurred while creating the poll.");
    }
}

async function fetchPolls() {
    try {
        const polls = await backend.list_polls();
        displayPolls(polls);
    } catch (error) {
        console.error("Error fetching polls:", error);
    }
}

function displayPolls(polls) {
    const pollsList = document.getElementById("pollsList");
    pollsList.innerHTML = "";

    polls.forEach(poll => {
        const pollElement = document.createElement("div");
        pollElement.className = "poll";
        pollElement.innerHTML = `
            <h3>${poll.question}</h3>
            <ul>
                ${poll.options.map((option, index) => `
                    <li>
                        ${option} (Votes: ${poll.votes[index]})
                        <button onclick="vote(${poll.id}, ${index})">Vote</button>
                    </li>
                `).join("")}
            </ul>
        `;
        pollsList.appendChild(pollElement);
    });
}

async function vote(pollId, optionIndex) {
    if (!isAuthenticated) {
        alert("Please login to vote.");
        return;
    }

    try {
        const result = await backend.vote({ poll_id: pollId, option_index: optionIndex });
        if ("ok" in result) {
            alert("Vote cast successfully!");
            fetchPolls();
        } else {
            alert("Failed to cast vote: " + result.err);
        }
    } catch (error) {
        console.error("Error casting vote:", error);
        alert("An error occurred while casting your vote.");
    }
}

window.vote = vote;

document.getElementById("createPollForm").addEventListener("submit", createPoll);

init();
