// Enhanced mock data with more variety
const mockComments = [
    { id: 1, text: "This is absolutely amazing! Love the content 🔥", sentiment: "positive", emotion: "joy", timestamp: "2m ago" },
    { id: 2, text: "Terrible video, waste of my time", sentiment: "negative", emotion: "anger", timestamp: "3m ago" },
    { id: 3, text: "Pretty decent explanation, could be better", sentiment: "neutral", emotion: "neutral", timestamp: "5m ago" },
    { id: 4, text: "BEST TUTORIAL EVER! Thank you so much!", sentiment: "positive", emotion: "joy", timestamp: "7m ago" },
    { id: 5, text: "I don't understand anything, so confusing", sentiment: "negative", emotion: "sadness", timestamp: "8m ago" },
    { id: 6, text: "Wow, didn't expect that twist!", sentiment: "positive", emotion: "surprise", timestamp: "10m ago" },
    { id: 7, text: "Meh, it's okay I guess", sentiment: "neutral", emotion: "neutral", timestamp: "12m ago" },
    { id: 8, text: "This changed my perspective completely!", sentiment: "positive", emotion: "surprise", timestamp: "15m ago" },
    { id: 9, text: "Boring content, unsubscribing", sentiment: "negative", emotion: "anger", timestamp: "18m ago" },
    { id: 10, text: "Thanks for the tutorial, very helpful", sentiment: "positive", emotion: "joy", timestamp: "20m ago" },
    { id: 11, text: "Could you make a part 2?", sentiment: "neutral", emotion: "neutral", timestamp: "22m ago" },
    { id: 12, text: "This made me cry, so emotional", sentiment: "positive", emotion: "sadness", timestamp: "25m ago" },
    { id: 13, text: "Clickbait title, disappointed", sentiment: "negative", emotion: "anger", timestamp: "28m ago" },
    { id: 14, text: "Mind = blown 🤯", sentiment: "positive", emotion: "surprise", timestamp: "30m ago" },
    { id: 15, text: "Average content, nothing special", sentiment: "neutral", emotion: "neutral", timestamp: "32m ago" }
];

class CompactSentimentAnalyzer {
    constructor() {
        this.comments = [...mockComments];
        this.sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
        this.emotionCounts = { joy: 0, anger: 0, surprise: 0, sadness: 0, neutral: 0 };
        this.currentFilter = 'all';
        this.chartView = 'pie';
        this.isAnalyzing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.renderComments();
        this.updateAllStats();
        this.drawChart();
        this.startLiveUpdates();
        this.initializeSummary();
    }

    setupEventListeners() {
        // Analyze button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeComments();
            this.generateSummary();
        });

        // Sentiment cards
        document.querySelectorAll('.sentiment-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const sentiment = e.currentTarget.dataset.sentiment;
                this.filterComments(sentiment);
                this.highlightCard(e.currentTarget);
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.currentFilter = filter;
                this.updateFilterButtons(e.target);
                this.renderComments();
            });
        });

        // Chart view buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.chartView = view;
                this.updateChartButtons(e.target);
                this.drawChart();
            });
        });

        // Emotion bubbles
        document.querySelectorAll('.emotion-bubble').forEach(bubble => {
            bubble.addEventListener('click', (e) => {
                this.animateBubble(e.currentTarget);
            });
        });

        // Comment interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.comment-item')) {
                this.highlightComment(e.target.closest('.comment-item'));
            }
        });
    }

    loadInitialData() {
        // Count sentiments and emotions
        this.comments.forEach(comment => {
            this.sentimentCounts[comment.sentiment]++;
            this.emotionCounts[comment.emotion]++;
        });
    }

    initializeSummary() {
        const summaryContent = document.getElementById('summaryContent');
        summaryContent.innerHTML = `
            <p class="summary-text">Click "ANALYZE NOW" to generate an AI-powered summary of the video's comment sentiment and key themes.</p>
        `;
    }

    generateSummary() {
        const summaryStatus = document.getElementById('summaryStatus');
        const summaryContent = document.getElementById('summaryContent');
        
        // Set analyzing state
        summaryStatus.className = 'summary-status analyzing';
        summaryStatus.innerHTML = '<div class="status-dot"></div><span>ANALYZING</span>';
        
        summaryContent.innerHTML = `
            <p class="summary-text">Analyzing comment patterns and generating insights...</p>
        `;
        
        // Simulate API call
        setTimeout(() => {
            const totalComments = this.comments.length;
            const positivePercent = Math.round((this.sentimentCounts.positive / totalComments) * 100);
            const negativePercent = Math.round((this.sentimentCounts.negative / totalComments) * 100);
            
            let overallTone = 'Mixed';
            if (positivePercent > 60) overallTone = 'Positive';
            else if (negativePercent > 40) overallTone = 'Critical';
            
            const keyThemes = ['Tutorial Quality', 'Content Clarity', 'Engagement', 'Helpfulness'];
            const randomThemes = keyThemes.sort(() => 0.5 - Math.random()).slice(0, 3);
            
            summaryStatus.className = 'summary-status complete';
            summaryStatus.innerHTML = '<div class="status-dot"></div><span>COMPLETE</span>';
            
            summaryContent.innerHTML = `
                <p class="summary-text">
                    <strong>Overall Tone:</strong> ${overallTone} (${positivePercent}% positive, ${negativePercent}% negative)<br>
                    <strong>Engagement:</strong> High community interaction with ${totalComments} comments<br>
                    <strong>Key Themes:</strong> Viewers appreciate the content quality and clarity
                </p>
                <div class="summary-highlights">
                    ${randomThemes.map(theme => `<span class="summary-tag">${theme}</span>`).join('')}
                </div>
            `;
        }, 2500);
    }

    updateAllStats() {
        const total = this.comments.length;
        
        // Update header total
        document.getElementById('totalCount').textContent = total;

        // Update sentiment cards
        document.getElementById('positiveValue').textContent = this.sentimentCounts.positive;
        document.getElementById('negativeValue').textContent = this.sentimentCounts.negative;
        document.getElementById('neutralValue').textContent = this.sentimentCounts.neutral;

        // Update percentages
        document.getElementById('positivePercent').textContent = 
            Math.round((this.sentimentCounts.positive / total) * 100) + '%';
        document.getElementById('negativePercent').textContent = 
            Math.round((this.sentimentCounts.negative / total) * 100) + '%';
        document.getElementById('neutralPercent').textContent = 
            Math.round((this.sentimentCounts.neutral / total) * 100) + '%';

        // Update emotion bubbles
        document.querySelector('[data-emotion="joy"] .bubble-count').textContent = this.emotionCounts.joy;
        document.querySelector('[data-emotion="anger"] .bubble-count').textContent = this.emotionCounts.anger;
        document.querySelector('[data-emotion="surprise"] .bubble-count').textContent = this.emotionCounts.surprise;
        document.querySelector('[data-emotion="sadness"] .bubble-count').textContent = this.emotionCounts.sadness;

        // Update quick stats
        const avgSentiment = (this.sentimentCounts.positive - this.sentimentCounts.negative) / total;
        document.querySelector('.quick-value.positive').textContent = 
            (avgSentiment > 0 ? '+' : '') + avgSentiment.toFixed(2);
    }

    renderComments() {
        const commentsList = document.getElementById('commentsList');
        
        // Clear existing comments
        while (commentsList.firstChild) {
            commentsList.removeChild(commentsList.firstChild);
        }

        let filteredComments = this.comments;
        
        if (this.currentFilter !== 'all') {
            filteredComments = this.comments.filter(comment => 
                comment.sentiment === this.currentFilter
            );
        }

        // Ensure we don't exceed available comments
        const commentsToShow = Math.min(8, filteredComments.length);
        
        filteredComments.slice(0, commentsToShow).forEach((comment, index) => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.style.animationDelay = `${index * 50}ms`;
            
            commentElement.innerHTML = `
                <div class="comment-sentiment ${comment.sentiment}">
                    ${this.getSentimentIcon(comment.sentiment)}
                </div>
                <div class="comment-content">
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-meta">${comment.timestamp} • ${comment.emotion}</div>
                </div>
            `;
            
            commentsList.appendChild(commentElement);
        });
        
        // Add empty state if no comments
        if (filteredComments.length === 0) {
            const emptyElement = document.createElement('div');
            emptyElement.className = 'comment-item';
            emptyElement.innerHTML = `
                <div class="comment-content">
                    <div class="comment-text" style="color: var(--text-muted); font-style: italic;">
                        No ${this.currentFilter} comments found
                    </div>
                </div>
            `;
            commentsList.appendChild(emptyElement);
        }
    }

    getSentimentIcon(sentiment) {
        const icons = {
            positive: '✓',
            negative: '✕',
            neutral: '○'
        };
        return icons[sentiment] || '○';
    }

    filterComments(sentiment) {
        this.currentFilter = sentiment;
        this.renderComments();
        
        // Update filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${sentiment}"]`).classList.add('active');
    }

    highlightCard(card) {
        // Remove previous highlights
        document.querySelectorAll('.sentiment-card').forEach(c => {
            c.style.transform = '';
            c.style.boxShadow = '';
        });

        // Highlight selected card
        card.style.transform = 'translateY(-4px) scale(1.02)';
        card.style.boxShadow = '0 8px 25px rgba(255, 68, 68, 0.2)';

        setTimeout(() => {
            card.style.transform = '';
            card.style.boxShadow = '';
        }, 1000);
    }

    updateFilterButtons(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    updateChartButtons(activeBtn) {
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    drawChart() {
        const canvas = document.getElementById('sentimentChart');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        switch (this.chartView) {
            case 'pie':
                this.drawPieChart(ctx, canvas);
                break;
            case 'bar':
                this.drawBarChart(ctx, canvas);
                break;
            case 'wave':
                this.drawWaveChart(ctx, canvas);
                break;
        }
    }

    drawPieChart(ctx, canvas) {
        const data = [
            { label: 'Positive', value: this.sentimentCounts.positive, color: '#00ff66' },
            { label: 'Negative', value: this.sentimentCounts.negative, color: '#ff4444' },
            { label: 'Neutral', value: this.sentimentCounts.neutral, color: '#666666' }
        ];
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50;
        
        let currentAngle = -Math.PI / 2;
        
        data.forEach(item => {
            if (item.value > 0) {
                const sliceAngle = (item.value / total) * 2 * Math.PI;
                
                // Create gradient
                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                gradient.addColorStop(0, item.color + '80');
                gradient.addColorStop(1, item.color);
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                currentAngle += sliceAngle;
            }
        });
        
        // Glassy inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = innerGradient;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawBarChart(ctx, canvas) {
        const data = [
            { label: 'Pos', value: this.sentimentCounts.positive, color: '#00ff66' },
            { label: 'Neg', value: this.sentimentCounts.negative, color: '#ff4444' },
            { label: 'Neu', value: this.sentimentCounts.neutral, color: '#666666' }
        ];
        
        const maxValue = Math.max(...data.map(d => d.value));
        const barWidth = 50;
        const barSpacing = 15;
        const startX = (canvas.width - (data.length * barWidth + (data.length - 1) * barSpacing)) / 2;
        
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * 80;
            const x = startX + index * (barWidth + barSpacing);
            const y = canvas.height - 30 - barHeight;
            
            // Create gradient for bar
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, item.color);
            gradient.addColorStop(1, item.color + '40');
            
            // Draw glassy bar
            ctx.fillStyle = gradient;
            ctx.roundRect(x, y, barWidth, barHeight, 4);
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Add glass effect
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Draw label
            ctx.fillStyle = item.color;
            ctx.font = 'bold 9px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, canvas.height - 15);
        });
    }

    drawWaveChart(ctx, canvas) {
        const data = [this.sentimentCounts.positive, this.sentimentCounts.negative, this.sentimentCounts.neutral];
        const colors = ['#00ff66', '#ff4444', '#666666'];
        const maxValue = Math.max(...data);
        
        data.forEach((value, index) => {
            // Create gradient for wave
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, colors[index] + '80');
            gradient.addColorStop(0.5, colors[index]);
            gradient.addColorStop(1, colors[index] + '40');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const amplitude = (value / maxValue) * 20;
            const frequency = 0.03;
            const yOffset = 30 + index * 35;
            
            for (let x = 0; x < canvas.width; x++) {
                const y = yOffset + Math.sin(x * frequency + Date.now() * 0.002) * amplitude;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = colors[index];
            ctx.shadowBlur = 5;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
    }

    analyzeComments() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        const btn = document.getElementById('analyzeBtn');
        const progress = document.getElementById('btnProgress');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        // Update UI
        btn.classList.add('analyzing');
        statusIndicator.className = 'status-indicator processing';
        statusText.textContent = 'ANALYZING COMMENTS...';
        
        // Simulate analysis
        setTimeout(() => {
            this.isAnalyzing = false;
            btn.classList.remove('analyzing');
            statusIndicator.className = 'status-indicator ready';
            statusText.textContent = 'ANALYSIS COMPLETE';
            
            // Add some visual feedback
            this.flashStats();
            
            setTimeout(() => {
                statusText.textContent = 'READY TO ANALYZE';
            }, 3000);
        }, 2000);
    }

    animateBubble(bubble) {
        bubble.style.transform = 'scale(1.3) rotate(10deg)';
        bubble.style.background = 'rgba(255, 68, 68, 0.1)';
        
        setTimeout(() => {
            bubble.style.transform = '';
            bubble.style.background = '';
        }, 300);
    }

    highlightComment(comment) {
        comment.style.background = 'rgba(255, 68, 68, 0.05)';
        comment.style.borderLeft = '3px solid #ff4444';
        
        setTimeout(() => {
            comment.style.background = '';
            comment.style.borderLeft = '';
        }, 1000);
    }

    flashStats() {
        document.querySelectorAll('.sentiment-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.background = 'rgba(255, 68, 68, 0.1)';
                card.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    card.style.background = '';
                    card.style.transform = '';
                }, 300);
            }, index * 100);
        });
    }

    startLiveUpdates() {
        // Simulate live comment updates
        setInterval(() => {
            if (!this.isAnalyzing) {
                this.updateTimestamps();
                this.animateRandomBubble();
            }
        }, 5000);
        
        // Update chart animation for wave view
        if (this.chartView === 'wave') {
            setInterval(() => {
                if (this.chartView === 'wave') {
                    this.drawChart();
                }
            }, 50);
        }
    }

    updateTimestamps() {
        document.querySelector('.last-update').textContent = 'Updated just now';
        setTimeout(() => {
            document.querySelector('.last-update').textContent = 'Updated 2s ago';
        }, 2000);
    }

    animateRandomBubble() {
        const bubbles = document.querySelectorAll('.emotion-bubble');
        const randomBubble = bubbles[Math.floor(Math.random() * bubbles.length)];
        this.animateBubble(randomBubble);
    }
}

// Initialize the analyzer
document.addEventListener('DOMContentLoaded', () => {
    new CompactSentimentAnalyzer();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('analyzeBtn').click();
    }
    
    if (e.key >= '1' && e.key <= '3') {
        const filters = ['positive', 'negative', 'neutral'];
        const filter = filters[parseInt(e.key) - 1];
        document.querySelector(`[data-filter="${filter}"]`).click();
    }
});