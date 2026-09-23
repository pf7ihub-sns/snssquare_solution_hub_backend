pipeline {
    agent any

    tools {
        nodejs "NodeJS_22"
    }

    environment {
        IMAGE_NAME = "client-demo-backend"
        PORT = "5001"
    }

    stages {
        stage('Check Node Version') {
            steps {
                sh '''
                    echo "Node Version:"
                    node -v
                    echo "NPM Version:"
                    npm -v
                '''
            }
        }

        stage('Clean Workspace') {
            steps {
                sh '''
                    rm -rf node_modules
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    npm ci
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                        -t $IMAGE_NAME:$BUILD_NUMBER \
                        -t $IMAGE_NAME:latest \
                        .
                '''
            }
        }

        stage('Verify Image') {
            steps {
                sh '''
                    docker image inspect $IMAGE_NAME:$BUILD_NUMBER
                    echo "Image $IMAGE_NAME:$BUILD_NUMBER built successfully."
                '''
            }
        }
    }

    post {
        success {
            echo "Backend image build successful."
        }

        failure {
            echo "Backend image build failed."
        }

        always {
            deleteDir()
        }
    }
}
