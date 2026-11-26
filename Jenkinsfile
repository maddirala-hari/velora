
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
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
                sh 'docker build -t velora-app:latest .'
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

        stage('Push Image to ECR') {
            steps {
                sh '''
                    docker tag velora-app:latest ${ECR_URI}:latest
                    docker push ${ECR_URI}:latest
                '''
            }
        }

        stage('Production Deployment with Rollback') {
            steps {
                sh '''
                    set -e

                    DEPLOY_SCRIPT=$(cat <<'SCRIPT'
set -e

ECR_URI="062104739226.dkr.ecr.ap-south-1.amazonaws.com/velora-app"

aws ecr get-login-password --region ap-south-1 |
docker login --username AWS --password-stdin 062104739226.dkr.ecr.ap-south-1.amazonaws.com

docker pull ${ECR_URI}:latest

# Preserve the currently running container
docker rm -f velora-previous 2>/dev/null || true

if docker inspect velora-ci-test >/dev/null 2>&1; then
    docker stop velora-ci-test
    docker rename velora-ci-test velora-previous
fi

# Start new production container
if ! docker run -d \
    --name velora-ci-test \
    --restart unless-stopped \
    -p 127.0.0.1:5001:5000 \
    ${ECR_URI}:latest; then

    if docker inspect velora-previous >/dev/null 2>&1; then
        docker rename velora-previous velora-ci-test
        docker start velora-ci-test
    fi

    exit 1
fi

# Health check
for i in $(seq 1 20); do
    if curl -fsS http://127.0.0.1:5001/api/health; then
        echo "Production deployment successful"
        docker rm -f velora-previous 2>/dev/null || true
        exit 0
    fi
    sleep 3
done

echo "New deployment failed. Rolling back..."

docker logs velora-ci-test || true
docker rm -f velora-ci-test || true

if docker inspect velora-previous >/dev/null 2>&1; then
    docker rename velora-previous velora-ci-test
    docker start velora-ci-test
    echo "Previous container restored"
fi

exit 1
SCRIPT
)

                    ENCODED_SCRIPT=$(printf '%s' "$DEPLOY_SCRIPT" | base64 -w0)

                    COMMAND_ID=$(aws ssm send-command \
                      --instance-ids ${APP_INSTANCE_ID} \
                      --document-name AWS-RunShellScript \
                      --parameters "{\"commands\":[\"echo ${ENCODED_SCRIPT} | base64 -d | bash\"]}" \
                      --region ${AWS_REGION} \
                      --query 'Command.CommandId' \
                      --output text)

                    echo "SSM Command ID: ${COMMAND_ID}"

                    for i in $(seq 1 36); do
                        STATUS=$(aws ssm get-command-invocation \
                          --command-id "$COMMAND_ID" \
                          --instance-id ${APP_INSTANCE_ID} \
                          --region ${AWS_REGION} \
                          --query 'Status' \
                          --output text 2>/dev/null || true)

                        echo "Deployment status: ${STATUS}"

                        if [ "$STATUS" = "Success" ]; then
                            echo "VELORA production deployment successful"
                            exit 0
                        fi

                        if [ "$STATUS" = "Failed" ] || \
                           [ "$STATUS" = "TimedOut" ] || \
                           [ "$STATUS" = "Cancelled" ]; then

                            aws ssm get-command-invocation \
                              --command-id "$COMMAND_ID" \
                              --instance-id ${APP_INSTANCE_ID} \
                              --region ${AWS_REGION}

                            exit 1
                        fi

                        sleep 5
                    done

                    echo "Deployment monitoring timed out"
                    exit 1
                '''
            }
        }
    }
}
