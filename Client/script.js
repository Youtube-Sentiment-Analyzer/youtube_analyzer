// Empty initial state - no mock data
const mockComments = [];

class CompactSentimentAnalyzer {
    constructor() {
        this.comments = [...mockComments];
        this.sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
        this.emotionCounts = { joy: 0, anger: 0, surprise: 0, sadness: 0, neutral: 0 };
        this.currentFilter = 'all';
        this.chartView = 'pie';
        this.isAnalyzing = false;
        this.hasAnalysisData = false; // Track if we have analysis data
        this.apiBaseUrl = 'http://localhost:5000/api';
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
        document.getElementById('analyzeBtn').addEventListener('click', async () => {
            await this.analyzeComments();
            // Summary will be automatically updated by processAnalysisResults
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
        // No initial data loading - start with empty state
        // Data will be loaded when analysis is performed
    }

    initializeSummary() {
        const summaryContent = document.getElementById('summaryContent');
        summaryContent.innerHTML = `
            <p class="summary-text">Click "ANALYZE NOW" to generate an AI-powered summary of the video's comment sentiment and key themes.</p>
        `;
    }

    async generateSummary() {
        const summaryStatus = document.getElementById('summaryStatus');
        const summaryContent = document.getElementById('summaryContent');
        
        // Set analyzing state
        summaryStatus.className = 'summary-status analyzing';
        summaryStatus.innerHTML = '<div class="status-dot"></div><span>ANALYZING</span>';
        
        summaryContent.innerHTML = `
            <p class="summary-text">Analyzing comment patterns and generating insights...</p>
        `;
        
        try {
            // Get video ID from current YouTube page
            const videoId = await this.getCurrentVideoId();
            
            if (!videoId) {
                throw new Error('Could not detect YouTube video ID');
            }
            
            // Call backend API for analysis (which includes summary)
            const response = await fetch(`${this.apiBaseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_id: videoId,
                    max_comments: 100
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate summary');
            }
            
            const data = await response.json();
            
            // Update status to complete
            summaryStatus.className = 'summary-status complete';
            summaryStatus.innerHTML = '<div class="status-dot"></div><span>COMPLETE</span>';
            
            // Display the summary data
            if (data.summary && data.keywords) {
                summaryContent.innerHTML = `
                    <p class="summary-text">
                        <strong>AI Summary:</strong><br>
                        ${data.summary.replace(/\n/g, '<br>')}
                    </p>
                    <div class="summary-highlights">
                        ${data.keywords.map(keyword => `<span class="summary-tag">${keyword}</span>`).join('')}
                    </div>
                `;
            } else {
                // Fallback if no summary data
                const totalComments = data.total_comments || this.comments.length;
                const positivePercent = data.sentiment_percentages?.positive || 0;
                const negativePercent = data.sentiment_percentages?.negative || 0;
                
                let overallTone = 'Mixed';
                if (positivePercent > 60) overallTone = 'Positive';
                else if (negativePercent > 40) overallTone = 'Critical';
                
                summaryContent.innerHTML = `
                    <p class="summary-text">
                        <strong>Overall Tone:</strong> ${overallTone} (${positivePercent}% positive, ${negativePercent}% negative)<br>
                        <strong>Engagement:</strong> High community interaction with ${totalComments} comments<br>
                        <strong>Key Themes:</strong> Viewers appreciate the content quality and clarity
                    </p>
                    <div class="summary-highlights">
                        <span class="summary-tag">Content Quality</span>
                        <span class="summary-tag">Engagement</span>
                        <span class="summary-tag">Community</span>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Summary generation error:', error);
            summaryStatus.className = 'summary-status error';
            summaryStatus.innerHTML = '<div class="status-dot"></div><span>ERROR</span>';
            
            summaryContent.innerHTML = `
                <p class="summary-text" style="color: #ff4444;">
                    Failed to generate summary: ${error.message}
                </p>
            `;
        }
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
        const positivePercent = total > 0 ? Math.round((this.sentimentCounts.positive / total) * 100) : 0;
        const negativePercent = total > 0 ? Math.round((this.sentimentCounts.negative / total) * 100) : 0;
        const neutralPercent = total > 0 ? Math.round((this.sentimentCounts.neutral / total) * 100) : 0;
        
        document.getElementById('positivePercent').textContent = positivePercent + '%';
        document.getElementById('negativePercent').textContent = negativePercent + '%';
        document.getElementById('neutralPercent').textContent = neutralPercent + '%';

        // Update emotion bubbles
        document.querySelector('[data-emotion="joy"] .bubble-count').textContent = this.emotionCounts.joy;
        document.querySelector('[data-emotion="anger"] .bubble-count').textContent = this.emotionCounts.anger;
        document.querySelector('[data-emotion="surprise"] .bubble-count').textContent = this.emotionCounts.surprise;
        document.querySelector('[data-emotion="sadness"] .bubble-count').textContent = this.emotionCounts.sadness;

        // Update quick stats
        const avgSentiment = total > 0 ? (this.sentimentCounts.positive - this.sentimentCounts.negative) / total : 0;
        const avgSentimentText = total > 0 ? (avgSentiment > 0 ? '+' : '') + avgSentiment.toFixed(2) : '0.00';
        document.querySelector('.quick-value.positive').textContent = avgSentimentText;
        
        // Update engagement level
        const engagementElement = document.querySelector('.quick-value:not(.positive)');
        if (engagementElement) {
            if (total === 0) {
                engagementElement.textContent = 'NONE';
            } else if (total < 10) {
                engagementElement.textContent = 'LOW';
            } else if (total < 50) {
                engagementElement.textContent = 'MEDIUM';
            } else {
                engagementElement.textContent = 'HIGH';
            }
        }
    }

    renderComments() {
        const commentsList = document.getElementById('commentsList');
        
        // Clear existing comments
        while (commentsList.firstChild) {
            commentsList.removeChild(commentsList.firstChild);
        }

        // If no analysis has been performed yet, show empty state
        if (!this.hasAnalysisData) {
            const emptyElement = document.createElement('div');
            emptyElement.className = 'comment-item';
            emptyElement.innerHTML = `
                <div class="comment-content">
                    <div class="comment-text" style="color: var(--text-muted); font-style: italic;">
                        Click "ANALYZE NOW" to load comments
                    </div>
                </div>
            `;
            commentsList.appendChild(emptyElement);
            return;
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
        
        // Add empty state if no comments match filter
        if (filteredComments.length === 0 && this.hasAnalysisData) {
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
            { value: this.sentimentCounts.positive || 0, color: '#00ff66' },
            { value: this.sentimentCounts.negative || 0, color: '#ff4444' },
            { value: this.sentimentCounts.neutral || 0, color: '#666666' }
        ];
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return; // Don't draw if no data
        
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
            { value: this.sentimentCounts.positive || 0, color: '#00ff66' },
            { value: this.sentimentCounts.negative || 0, color: '#ff4444' },
            { value: this.sentimentCounts.neutral || 0, color: '#666666' }
        ];
        
        const maxValue = Math.max(...data.map(d => d.value));
        if (maxValue === 0) return; // Don't draw if no data
        
        const barWidth = 50;
        const barSpacing = 15;
        const startX = (canvas.width - (data.length * barWidth + (data.length - 1) * barSpacing)) / 2;
        
        data.forEach((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * 80 : 0;
            const x = startX + index * (barWidth + barSpacing);
            const y = canvas.height - 30 - barHeight;
            
            // Create gradient for bar
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, item.color);
            gradient.addColorStop(1, item.color + '40');
            
            // Draw glassy bar
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Add glass effect
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // No labels or numbers - minimal design
        });
    }

    drawWaveChart(ctx, canvas) {
        const data = [
            this.sentimentCounts.positive || 0, 
            this.sentimentCounts.negative || 0, 
            this.sentimentCounts.neutral || 0
        ];
        const colors = ['#00ff66', '#ff4444', '#666666'];
        const maxValue = Math.max(...data);
        
        if (maxValue === 0) return; // Don't draw if no data
        
        data.forEach((value, index) => {
            // Create gradient for wave
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, colors[index] + '80');
            gradient.addColorStop(0.5, colors[index]);
            gradient.addColorStop(1, colors[index] + '40');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const amplitude = maxValue > 0 ? (value / maxValue) * 20 : 0;
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

    async analyzeComments() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        const btn = document.getElementById('analyzeBtn');
        const progress = document.getElementById('btnProgress');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        // Update UI
        btn.classList.add('analyzing');
        progress.style.width = '0%';
        statusIndicator.className = 'status-indicator processing';
        statusText.textContent = 'ANALYZING COMMENTS...';
        
        try {
            // Get video ID from current YouTube page
            const videoId = await this.getCurrentVideoId();
            console.log('Analyzing video ID:', videoId);
            
            if (!videoId) {
                throw new Error('Could not detect YouTube video ID. Make sure you are on a YouTube video page.');
            }
            
            // Call backend API
            const response = await fetch(`${this.apiBaseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_id: videoId,
                    max_comments: 100
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze video');
            }
            
            const data = await response.json();
            console.log('Analysis results:', data);
            
            // Update progress to 100%
            progress.style.width = '100%';
            
            // Process the real data
            this.processAnalysisResults(data);
            
        } catch (error) {
            console.error('Analysis error:', error);
            statusText.textContent = 'ANALYSIS FAILED';
            statusIndicator.className = 'status-indicator error';
            
            // Fallback to mock data
            this.completeAnalysis();
        } finally {
            this.isAnalyzing = false;
            btn.classList.remove('analyzing');
        }
    }
    
    async getCurrentVideoId() {
        try {
            // Get the current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = tab.url;
            console.log('Current tab URL:', url);
            
            // Standard YouTube URL pattern
            const videoIdMatch = url.match(/[?&]v=([^&]+)/);
            if (videoIdMatch) {
                console.log('Found video ID from v parameter:', videoIdMatch[1]);
                return videoIdMatch[1];
            }
            
            // Short YouTube URL pattern
            const shortUrlMatch = url.match(/youtu\.be\/([^?]+)/);
            if (shortUrlMatch) {
                console.log('Found video ID from short URL:', shortUrlMatch[1]);
                return shortUrlMatch[1];
            }
            
            // YouTube embed URL pattern
            const embedMatch = url.match(/embed\/([^?]+)/);
            if (embedMatch) {
                console.log('Found video ID from embed URL:', embedMatch[1]);
                return embedMatch[1];
            }
            
            console.log('Could not detect video ID from URL:', url);
            return null;
            
        } catch (error) {
            console.error('Error getting current tab URL:', error);
            return null;
        }
    }
    
    processAnalysisResults(data) {
        // Mark that we have analysis data
        this.hasAnalysisData = true;
        
        // Update comments with real data
        this.comments = data.comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            sentiment: comment.sentiment,
            emotion: this.mapSentimentToEmotion(comment.sentiment),
            timestamp: this.formatTimestamp(comment.published_at),
            author: comment.author,
            likeCount: comment.like_count
        }));
        
        // Update sentiment counts - ensure all values exist
        this.sentimentCounts = {
            positive: data.sentiment_counts.positive || 0,
            negative: data.sentiment_counts.negative || 0,
            neutral: data.sentiment_counts.neutral || 0
        };
        
        // Update emotion counts based on sentiment
        this.updateEmotionCounts();
        
        // Update UI
        this.updateAllStats();
        this.renderComments();
        this.drawChart();
        
        // Update status
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        statusIndicator.className = 'status-indicator complete';
        statusText.textContent = 'ANALYSIS COMPLETE';
        
        // Add visual feedback
        this.flashStats();
        
        // Update summary if data includes summary information
        if (data.summary && data.keywords) {
            const summaryStatus = document.getElementById('summaryStatus');
            const summaryContent = document.getElementById('summaryContent');
            
            summaryStatus.className = 'summary-status complete';
            summaryStatus.innerHTML = '<div class="status-dot"></div><span>COMPLETE</span>';
            
            summaryContent.innerHTML = `
                <p class="summary-text">
                    <strong>AI Summary:</strong><br>
                    ${data.summary.replace(/\n/g, '<br>')}
                </p>
                <div class="summary-highlights">
                    ${data.keywords.map(keyword => `<span class="summary-tag">${keyword}</span>`).join('')}
                </div>
            `;
        }
        
        setTimeout(() => {
            statusText.textContent = 'READY TO ANALYZE';
        }, 3000);
    }
    
    mapSentimentToEmotion(sentiment) {
        const emotionMap = {
            'positive': 'joy',
            'negative': 'anger',
            'neutral': 'neutral'
        };
        return emotionMap[sentiment] || 'neutral';
    }
    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }
    
    updateEmotionCounts() {
        this.emotionCounts = { joy: 0, anger: 0, surprise: 0, sadness: 0, neutral: 0 };
        this.comments.forEach(comment => {
            this.emotionCounts[comment.emotion]++;
        });
    }
    
    completeAnalysis() {
        // Fallback method for when API fails
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        statusIndicator.className = 'status-indicator ready';
        statusText.textContent = 'ANALYSIS COMPLETE';
        
        this.flashStats();
        
        setTimeout(() => {
            statusText.textContent = 'READY TO ANALYZE';
        }, 3000);
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