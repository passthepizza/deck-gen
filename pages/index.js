export default function Home() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Anki Deck Generator</title>
        <style>
            :root {
                --primary: #6366f1;
                --background: #f8fafc;
                --text: #1e293b;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: system-ui, -apple-system, sans-serif;
                background: var(--background);
                color: var(--text);
                line-height: 1.5;
                padding: 2rem;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
            }

            h1 {
                font-size: 2.5rem;
                margin-bottom: 2rem;
                text-align: center;
                color: var(--primary);
            }

            .input-section {
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                margin-bottom: 2rem;
            }

            .tabs {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .tab {
                padding: 0.5rem 1rem;
                border: none;
                background: none;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }

            .tab.active {
                border-bottom-color: var(--primary);
                color: var(--primary);
            }

            .input-content {
                margin-bottom: 1rem;
            }

            .url-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #e2e8f0;
                border-radius: 0.5rem;
                margin-bottom: 1rem;
            }

            .file-drop {
                border: 2px dashed #e2e8f0;
                border-radius: 0.5rem;
                padding: 2rem;
                text-align: center;
                cursor: pointer;
            }

            .file-drop.dragover {
                border-color: var(--primary);
                background: #f1f5f9;
            }

            .generate-btn {
                width: 100%;
                padding: 0.75rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 1rem;
                transition: opacity 0.2s;
            }

            .generate-btn:hover {
                opacity: 0.9;
            }

            .loading {
                text-align: center;
                margin: 2rem 0;
                display: none;
            }

            .flashcards {
                display: grid;
                gap: 1rem;
                margin-top: 2rem;
            }

            .flashcard {
                background: white;
                padding: 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1);
            }

            .flashcard h3 {
                color: var(--primary);
                margin-bottom: 0.5rem;
            }

            .download-btn {
                display: none;
                margin: 2rem auto;
                padding: 0.75rem 1.5rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 1rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>AI Anki Deck Generator</h1>
            
            <div class="input-section">
                <div class="tabs">
                    <button class="tab active" data-tab="url">URL</button>
                    <button class="tab" data-tab="pdf">PDF</button>
                </div>

                <div class="input-content" id="url-input">
                    <input type="url" class="url-input" placeholder="Enter URL">
                </div>

                <div class="input-content" id="pdf-input" style="display: none;">
                    <div class="file-drop">
                        <p>Drag and drop your PDF here or click to select</p>
                        <input type="file" accept=".pdf" style="display: none">
                    </div>
                </div>

                <button class="generate-btn">Generate Flashcards</button>
            </div>

            <div class="loading">
                <p>Generating flashcards...</p>
            </div>

            <div class="flashcards"></div>
            
            <button class="download-btn">Download Anki Deck</button>
        </div>

        <script>
            // Tab switching
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    document.querySelectorAll('.input-content').forEach(content => {
                        content.style.display = 'none';
                    });
                    document.getElementById(`${tab.dataset.tab}-input`).style.display = 'block';
                });
            });

            // File drop handling
            const fileDrop = document.querySelector('.file-drop');
            const fileInput = fileDrop.querySelector('input');

            fileDrop.addEventListener('click', () => fileInput.click());

            fileDrop.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileDrop.classList.add('dragover');
            });

            fileDrop.addEventListener('dragleave', () => {
                fileDrop.classList.remove('dragover');
            });

            fileDrop.addEventListener('drop', (e) => {
                e.preventDefault();
                fileDrop.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file && file.type === 'application/pdf') {
                    handleFile(file);
                }
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    handleFile(file);
                }
            });

            function handleFile(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Store the base64 content
                    fileDrop.dataset.content = e.target.result.split(',')[1];
                    fileDrop.querySelector('p').textContent = `Selected: ${file.name}`;
                };
                reader.readAsDataURL(file);
            }

            // Generate flashcards
            document.querySelector('.generate-btn').addEventListener('click', async () => {
                const activeTab = document.querySelector('.tab.active').dataset.tab;
                let content;
                let type;

                if (activeTab === 'url') {
                    content = document.querySelector('.url-input').value;
                    type = 'url';
                } else {
                    content = fileDrop.dataset.content;
                    type = 'pdf';
                }

                if (!content) {
                    alert('Please provide content to generate flashcards');
                    return;
                }

                const loading = document.querySelector('.loading');
                const flashcardsContainer = document.querySelector('.flashcards');
                const downloadBtn = document.querySelector('.download-btn');

                loading.style.display = 'block';
                flashcardsContainer.innerHTML = '';
                downloadBtn.style.display = 'none';

                try {
                    const response = await fetch('/api/process-content', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ type, content }),
                    });

                    const data = await response.json();

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    data.flashcards.forEach(card => {
                        const cardElement = document.createElement('div');
                        cardElement.className = 'flashcard';
                        cardElement.innerHTML = `
                            <h3>Question:</h3>
                            <p>${card.question}</p>
                            <h3>Answer:</h3>
                            <p>${card.answer}</p>
                        `;
                        flashcardsContainer.appendChild(cardElement);
                    });

                    downloadBtn.style.display = 'block';
                } catch (error) {
                    alert('Failed to generate flashcards: ' + error.message);
                } finally {
                    loading.style.display = 'none';
                }
            });

            // Download Anki deck
            document.querySelector('.download-btn').addEventListener('click', () => {
                const flashcards = Array.from(document.querySelectorAll('.flashcard')).map(card => {
                    const [question, answer] = card.querySelectorAll('p');
                    return `${question.textContent}\t${answer.textContent}`;
                }).join('\n');

                const blob = new Blob([flashcards], { type: 'text/tab-separated-values' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'anki-deck.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        </script>
    </body>
    </html>
  `;
}
