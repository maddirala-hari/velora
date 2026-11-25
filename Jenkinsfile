
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '062104739226'
        ECR_REPOSITORY = 'velora-app'
        IMAGE_TAG = 'latest'
        ECR_URI = '062104739226.dkr.ecr.ap-south-1.amazonaws.com/velora-app'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t velora-app:${IMAGE_TAG} .'
            }
        }

        stage('Login to AWS ECR') {
            steps {
                sh '''
                    aws ecr get-login-password --region ${AWS_REGION} |
                    docker login --username AWS --password-stdin ${ECR_URI}
                '''
            }
        }

        stage('Tag and Push Image') {
            steps {
                sh '''
                    docker tag velora-app:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
                    docker push ${ECR_URI}:${IMAGE_TAG}
                '''
            }
        }
    }
}
