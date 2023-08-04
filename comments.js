// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

// Create express app
const app = express();

// Use body parser to parse request body
app.use(bodyParser.json());

// Use cors
app.use(cors());

// Create comments object
const commentsByPostId = {};

// Create route to get comments for a post
app.get('/posts/:id/comments', (req, res) => {
  // Get comments for post
  const comments = commentsByPostId[req.params.id] || [];

  // Return comments
  res.send(comments);
});

// Create route to create a comment for a post
app.post('/posts/:id/comments', async (req, res) => {
  // Generate random id
  const id = randomBytes(4).toString('hex');

  // Get content from request body
  const { content } = req.body;

  // Get comments for post
  const comments = commentsByPostId[req.params.id] || [];

  // Add comment to comments
  comments.push({ id, content, status: 'pending' });

  // Update comments for post
  commentsByPostId[req.params.id] = comments;

  // Emit event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { id, content, postId: req.params.id, status: 'pending' },
  });

  // Return comments
  res.status(201).send(comments);
});

// Create route to receive events from event bus
app.post('/events', async (req, res) => {
  // Get event from request body
  const { type, data } = req.body;

  // Check event type
  if (type === 'CommentModerated') {
    // Get comments for post
    const comments = commentsByPostId[data.postId];

    // Get comment
    const comment = comments.find((comment) => comment.id === data.id);

    // Update comment
    comment.status = data.status;

    // Emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: { ...comment, postId: data.postId },
    });
    }   

    // Send response
    res.send({});
}
);