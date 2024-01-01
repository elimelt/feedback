const axios = require('axios');
const { send } = require('process');

const groups = [
    [{
        "Group": 1,
        "name": "Ruhee Rajwani",
        "email": "ruheer@uw.edu",
        "discord": ".rxhee",
        "problemName": "Merge Intervals",
        "problemLink": "https://leetcode.com/problems/merge-intervals/description"
    },
    {
        "Group": 1,
        "name": "Udayan Sharma",
        "email": "udayan02@cs.washington.edu",
        "discord": "scuderiaferrarisimp",
        "problemName": "Insert Interval",
        "problemLink": "https://leetcode.com/problems/insert-interval/description"
    }],
    [{
        "Group": 2,
        "name": "Jack Scott",
        "email": "jscott26@uw.edu",
        "discord": "_8311",
        "problemName": "Merge Intervals",
        "problemLink": "https://leetcode.com/problems/merge-intervals/description"
    },
    {
        "Group": 2,
        "name": "Deepayan Sanyal",
        "email": "dsanyal@uw.edu",
        "discord": "deep_philosopher",
        "problemName": "Insert Interval",
        "problemLink": "https://leetcode.com/problems/insert-interval/description"
    }],
    [{
        "Group": 3,
        "name": "Rajat Sengupta",
        "email": "rsen0811@uw.edu",
        "discord": "mlg_raj",
        "problemName": "Merge Intervals",
        "problemLink": "https://leetcode.com/problems/merge-intervals/description"
    },
    {
        "Group": 3,
        "name": "Gabriel Sison",
        "email": "gabsison@cs.washington.edu",
        "discord": "gabe835",
        "problemName": "Insert Interval",
        "problemLink": "https://leetcode.com/problems/insert-interval/description"
    }],
    [{
        "Group": 4,
        "name": "Johnny He",
        "email": "johnnyhe7@outlook.com",
        "discord": "onomatopotatos",
        "problemName": "Merge Intervals",
        "problemLink": "https://leetcode.com/problems/merge-intervals/description"
    },
    {
        "Group": 4,
        "name": "Elijah Melton",
        "email": "elimelt@uw.edu",
        "discord": "elimelt",
        "problemName": "Insert Interval",
        "problemLink": "https://leetcode.com/problems/insert-interval/description"
    }]
]




/*

person: {
    name: String,
    email: String,
    discord: String,
    problemLink: String,
    problemName: String,
}

*/

function generateBody(personA, personB) {
    return `<p>Hi ${personA.name},</p>
    
    <p>
        Thank you for submitting your feedback last week, and sorry these emails are coming out a bit late. You've
        been paired with ${personB.name} for this week's interviews, and you will be interviewing them on
        <a href="${personB.problemLink}">${personB.problemName}</a>.
    </p>

    <p>
        Please reach out to them through Discord at ${personB.discord} or email at ${personB.email} to
        schedule a time to meet. 
    </p>

    <p>
        There are not that many patterns associated with interval problems, so instead of reccomending any particular
        resources I suggest you just practice a few problems on your own. If you're looking for a problem to practice
        with, I suggest <a href="https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/">this one</a>.
    </p>

    <p>
    Best of luck!
    </p>
    `
}

function generateSubject() {
    return `OSIMP Partner Week 5`;
}

async function sendEmail(personA, personB) {
    axios.post('http://localhost:3001/email', {
        subject: generateSubject(),
        content: generateBody(personA, personB),
        to: personA.email,
        secret: 69
    })
}

// groups.forEach(group => {
//     sendEmail(group[0], group[1]).then(() => console.log(`sent email to ${group[0].name}`))
//     sendEmail(group[1], group[0]).then(() => console.log(`sent email to ${group[1].name}`))
// })


function generateReminderBody(person) {
    return `<p>Hi ${person.name},</p>

    <p>
        Just sending a quick reminder to update your availability for Winter quarter.
        Edit your response to <a href="https://forms.gle/Nks6z3ZfKapf777g7">this form</a>
        so it can be considered when we decide pairings.
    </p>

    <p>
        Thanks!
    </p>
    `
}

function generateReminderSubject() {
    return `OSIMP Winter Quarter Availability`;
}

async function sendReminderEmail(person) {
    email = {
        subject: generateReminderSubject(),
        content: generateReminderBody(person)
    }

    axios.post('http://localhost:3001/email', {
        subject: email.subject,
        content: email.content,
        to: person.email,
        secret: 69
    })

    return email
}

groups.forEach(group => {
    sendReminderEmail(group[0]).then((email) => console.log(`sent email to ${group[0].name}: ${email.content}`))
    sendReminderEmail(group[1]).then((email) => console.log(`sent email to ${group[1].name}: ${email.content}`))
})