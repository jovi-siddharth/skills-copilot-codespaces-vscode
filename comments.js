// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

// Create express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create comments object
const commentsByPostId = {};

// Handle post request to /posts/:id/comments
app.post('/posts/:id/comments', async (req, res) => {
  // Get post id from request params
  const { id } = req.params;

  // Get comment from request body
  const { content } = req.body;

  // Get comments for post id
  const comments = commentsByPostId[id] || [];

  // Generate comment id
  const commentId = Math.random().toString(36).substr(2, 5);

  // Add comment to comments object
  comments.push({ id: commentId, content, status: 'pending' });

  // Set comments for post id
  commentsByPostId[id] = comments;

  // Send comment created event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: id,
      status: 'pending',
    },
  });

  // Send response
  res.status(201).send(comments);
});

// Handle get request to /posts/:id/comments
app.get('/posts/:id/comments', (req, res) => {
  // Get post id from request params
  const { id } = req.params;

  // Get comments for post id
  const comments = commentsByPostId[id] || [];

  // Send response
  res.status(200).send(comments);
});

// Handle post request to /events
app.post('/events', async (req, res) => {
  // Get event type from request body
  const { type, data } = req.body;

  // Handle comment moderation event
  if (type === 'CommentModer