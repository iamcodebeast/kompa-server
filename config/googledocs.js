const { google } = require("googleapis");
const auth = new google.auth.GoogleAuth({
    keyFile: "./config/cred.json",
    scopes: [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
    ],
});

const docs = google.docs({
    version: "v1",
    auth,
});

const drive = google.drive({
    version: "v3",
    auth,
});

async function createDocumentFromTemplate(parentId, templateId, title) {
    const request = {
        requests: [
            {
                duplicateDocument: {
                    sourceDocumentId: templateId,
                    name: title,
                },
            },
        ],
        parents: [parentId], // 1kwZCs9IbGZMENUE_1oVW6Qunzw4edy1b
        name: title,
    };

    const response = await drive.files.copy({
        fileId: templateId,
        resource: request,
    });
    console.log(response);

    console.log(`docs created with id: ${response.data?.id}`);
    return response.data.id;
}

async function replaceText(documentId, obj) {
    const requests = [];

    Object.keys(obj).forEach((el) => {
        let template = {
            replaceAllText: {
                replaceText: obj[el],
                containsText: {
                    text: el,
                    matchCase: true,
                },
            },
        };
        requests.push(template);
    });
    await docs.documents.batchUpdate({
        documentId: documentId,
        resource: { requests },
    });
    console.log(`Replaced text in document: ${documentId}`);
    return {
        link: `https://docs.google.com/document/d/${documentId}/edit`,
    };
}

async function generateDocs(parentId, templateId, title, obj) {
    try {
        const docsId = await createDocumentFromTemplate(
            parentId,
            templateId, // 14S2BswNp0b5TlQeFBXl1aF7TsaZVGI7WMZsumVKpd1U
            title
        );
        const updatedDocs = await replaceText(docsId, obj);
        return updatedDocs;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    generateDocs,
};
