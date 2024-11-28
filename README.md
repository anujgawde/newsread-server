# NewsRead Server

The **NewsRead Server** is the backend service powering the NewsRead application. It is designed to handle news fetching, storage, and text-to-speech (TTS) functionality. This server interacts with the [newsdata.io API](https://newsdata.io/) for fetching news articles and leverages **AWS Polly** for generating audio files, ensuring a seamless and efficient experience for the user.

This server is essential for running the **NewsRead** application. To view the client-side code and integrate it with this backend, refer to the [newsread](https://github.com/anujgawde/newsread) repository.

## Features 🚀

-   **News Management**:
    -   Fetch and store the latest news articles.
    -   Retrieve trending, latest, or specific articles.
-   **Database Optimization**:
    -   Reduce API calls by efficiently storing fetched data in PostgreSQL.
-   **Text-to-Speech (TTS)**:
    -   Convert articles into audio using AWS Polly and stream it to users.
-   **Trending Analytics**:
    -   Track and update article visits for ranking popular articles.

## Installation & Setup ⚙️

### Prerequisites

-   **Node.js** and **npm** installed.
-   Setup **AWS Polly** and **AWS S3** enabled with appropriate access keys.

### Steps

1.  **Clone the Repository**:
    
    ```
    git clone https://github.com/anujgawde/newsread-server  
    cd newsread-server 
2.  **Install Dependencies**:
    
    ```
    npm install 
3.  **Set Environment Variables**:  
    Create a `.env` file in the root directory and configure the following variables:

    
    ```AWS_ACCESS_KEY_ID=your_aws_access_key_id  
    AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key  
    AWS_TTS_BUCKET_NAME=your_aws_s3_bucket_name  
    DB_URL=your_postgresql_connection_url  
    DB_NAME=your_database_name  
    DB_PASSWORD=your_database_password  
    NEWSDATA_API_KEY=your_newsdata_api_key 
4.  **Run the Server**:
    
    ```
    npm run start:dev 
5.  **Test the API**:  
    The server runs at `http://localhost:8001`. Use tools like Postman or your browser to test endpoints.

## API Endpoints 🛠️
`GET /articles/get-all-articles`: Retrieve all stored articles
`GET /articles/get-latest-articles`: Fetch and store the latest articles
`GET /articles/get-trending-articles`: Retrieve trending articles based on visits
`GET /articles/:id`: Retrieve a specific article by its ID
`POST /articles/read-article`: Convert article content to audio and play it
`POST /articles/update-article-visits`: Increment the visit count for an article

## Tech Stack 🛠️

-   **Backend Framework**: [NestJS](https://nestjs.com/)
-   **Database**:
    -   [PostgreSQL](https://www.postgresql.org/)
    -   [NeonDB](https://neon.tech/)
-   **Cloud Services**:
    -   [AWS Polly](https://aws.amazon.com/polly/)
    -   [AWS S3](https://aws.amazon.com/s3/)
-   **News API**: [newsdata.io](https://newsdata.io/)

## Roadmap 🗺️

-   Add API caching to reduce database queries.
-   Implement multi-language TTS support.
-   Enhance analytics for article performance.


## Contributing 🤝

Contributions are welcome! Please open an issue or submit a pull request for suggestions or improvements.

## Stay in touch

- Author - [Anuj Gawde](https://x.com/axgdevv)
