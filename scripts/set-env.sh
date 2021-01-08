#!/bin/bash

echo "JWT_SECRET=$JWT_SECRET" > .env
echo "PORT=$PORT" >> .env
echo "PAYPAL_CLIENT_ID=$PAYPAL_CLIENT_ID" >> .env
echo "GOOGLE_API_KEY=$GOOGLE_API_KEY" >> .env
echo "EMAIL=$EMAIL" >> .env
echo "EMAIL_PASSWORD=$EMAIL_PASSWORD" >> .env
echo "MONGODB_URL=$MONGODB_URL" >> .env
# echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" >> .env
# echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY" >> .env