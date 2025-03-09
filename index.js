const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
const GitHub_UserName = process.env.github_username;
const token = process.env.github_token;


// Condition 1 


app.get("/", (req,res)=>{
    res.send("Hello I am saksham! Welcome to GitHub API");
})


app.get('/github', async (req, res) => {
    try {
        
        const userResponse = await fetch(`https://api.github.com/users/${GitHub_UserName}`, {
            headers: { Authorization: `token ${token}` }
        });

        if (!userResponse.ok) throw new Error(`GitHub API Error: ${userResponse.status} ${userResponse.statusText}`);

        const userData = await userResponse.json();

        // Fetch repositories
        const reposResponse = await fetch(userData.repos_url, {
            headers: { Authorization: `token ${token}` }
        });

        if (!reposResponse.ok) throw new Error(`GitHub API Error: ${reposResponse.status} ${reposResponse.statusText}`);

        const reposList = await reposResponse.json();

        res.json({
            user: userData.login,
            followers: userData.followers,
            following: userData.following,
            location: userData.location,
            bio: userData.bio,
            repos: userData.public_repos,
            reposList: reposList.map(repo => ({
                name: repo.name,
                // description: repo.description,
                // url: repo.html_url 
            }))
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch GitHub data" });
    }
});

//  2

app.get("/github/:project", async (req, res) => {
    const { project } = req.params;

    try {
        const response = await fetch(`https://api.github.com/repos/${GitHub_UserName}/${project}`, {
            headers: {
                Authorization: `token ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Project Data:", data);

        res.json({
            name: data.name,
            description: data.description,
            language: data.language,
            url: data.html_url,
            forks: data.forks_count,
            stars: data.stargazers_count,
            watchers: data.watchers_count, 
            issues: data.open_issues_count 
        });
    } catch (error) {
        console.error("Error fetching project data:", error);
        res.status(500).json({ error: "Failed to fetch GitHub project data" });
    }
});


//3 

app.post("/github/:repoName/issues", async (req, res) => {
    try {
        const { title, body } = req.body; 
        if (!title || !body) {
            return res.status(400).json({ error: "Title and body are required" });
        }

        const response = await fetch(`https://api.github.com/repos/${GitHub_UserName}/${req.params.repoName}/issues`, {
            method: "POST",
            headers: {
                Authorization: `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, body })
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        res.json({
            title: data.title,
            body: data.body,
            url: data.html_url
        });

    } catch (error) {
        console.error("Error creating issue:", error);
        res.status(500).json({ error: "Failed to create GitHub issue" });
    }
});




app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})