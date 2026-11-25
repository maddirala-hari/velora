
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '062104739226'
        ECR_REPOSITORY = 'velora-app'
        IMAGE_TAG = 'latest'
        ECR_URI = '062104739226.dkr.ecr.ap-south-1.amazonaws.com/velora-app'
        APP_INSTANCE_ID = 'i-050378d0e15ff6d1c'
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

        stage('Deploy to App EC2') {
            steps {
                sh '''
                    set -e

                    COMMAND_ID=$(aws ssm send-command \
                      --instance-ids ${APP_INSTANCE_ID} \
                      --document-name AWS-RunShellScript \
                      --parameters '{"commands":["set -e","aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 062104739226.dkr.ecr.ap-south-1.amazonaws.com","docker pull 062104739226.dkr.ecr.ap-south-1.amazonaws.com/velora-app:latest","docker rm -f velora-ci-test || true","docker run -d --name velora-ci-test --restart unless-stopped -p 127.0.0.1:5001:5000 062104739226.dkr.ecr.ap-south-1.amazonaws.com/velora-app:latest","for i in $(seq 1 20); do if curl -fsS http://127.0.0.1:5001/api/health; then exit 0; fi; sleep 3; done","docker logs velora-ci-test","exit 1"]}' \
                      --region ${AWS_REGION} \
                      --query 'Command.CommandId' \
                      --output text)

                    echo "SSM Command ID: ${COMMAND_ID}"

                    sleep 5

                    for i in $(seq 1 30); do
                      STATUS=$(aws ssm get-command-invocation \
                        --command-id "$COMMAND_ID" \
                        --instance-id ${APP_INSTANCE_ID} \
                        --region ${AWS_REGION} \
                        --query 'Status' \
                        --output text 2>/dev/null || true)

                      echo "Deployment status: ${STATUS}"

                      if [ "$STATUS" = "Success" ]; then
                        echo "VELORA container deployment test successful"
                        exit 0
                      fi

                      if [ "$STATUS" = "Failed" ] || [ "$STATUS" = "TimedOut" ] || [ "$STATUS" = "Cancelled" ]; then
                        aws ssm get-command-invocation \
                          --command-id "$COMMAND_ID" \
                          --instance-id ${APP_INSTANCE_ID} \
                          --region ${AWS_REGION}
                        exit 1
                      fi

                      sleep 5
                    done

                    echo "Deployment timed out"
                    exit 1
                '''
            }
        }
    }
}

