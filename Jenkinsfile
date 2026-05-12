pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'prsperera/sample-form'
        DOCKER_TAG   = "${BUILD_NUMBER}"

        // ── Uncomment when backend is added ──
        // MONGO_URI  = credentials('MONGO_URI')
        // JWT_SECRET = credentials('JWT_SECRET')
    }

    // ── Uncomment when NodeJS plugin is configured ──
    tools {
         nodejs 'nodeJS'
     }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {

        // ════════════════════════════════════
        // STAGE 1 — Checkout
        // ════════════════════════════════════
        stage('Checkout') {
            steps {
                echo 'Pulling latest code from GitHub...'
                checkout scm
            }
        }

        // ════════════════════════════════════
        // STAGE 2 — Install Dependencies
        // ════════════════════════════════════
        stage('Install Dependencies') {
            parallel {

                // ── Frontend (React) ──
                stage('Frontend - npm install') {
                    steps {
                        // Frontend is in root, run directly
                        sh 'npm ci'

                        // ── Uncomment when frontend moved to client/ folder ──
                        // dir('client') {
                        //     sh 'npm ci'
                        // }
                    }
                }

                // ── Backend - Uncomment when backend is added ──
                // stage('Backend - npm install') {
                //     steps {
                //         dir('server') {
                //             sh 'npm ci'
                //         }
                //     }
                // }
            }
        }

        // ════════════════════════════════════
        // STAGE 3 — Lint
        // ════════════════════════════════════
        stage('Lint') {
            parallel {

                stage('Frontend - Lint') {
                    steps {
                        sh 'npm run lint --if-present'
                        // dir('client') { sh 'npm run lint --if-present' }
                    }
                }

                // ── Uncomment when backend is added ──
                // stage('Backend - Lint') {
                //     steps {
                //         dir('server') {
                //             sh 'npm run lint --if-present'
                //         }
                //     }
                // }
            }
        }

        // ════════════════════════════════════
        // STAGE 4 — Test
        // ════════════════════════════════════
        stage('Test') {
            parallel {

                stage('Frontend - Tests') {
                    steps {
                        sh 'CI=true npm test --if-present'
                        // dir('client') { sh 'CI=true npm test --if-present' }
                    }
                }

                // ── Uncomment when backend is added ──
                // stage('Backend - Tests') {
                //     steps {
                //         dir('server') {
                //             sh '''
                //                 export MONGO_URI="${MONGO_URI}"
                //                 export JWT_SECRET="${JWT_SECRET}"
                //                 export NODE_ENV=test
                //                 npm test --if-present
                //             '''
                //         }
                //     }
                // }
            }
        }

        // ════════════════════════════════════
        // STAGE 5 — Build
        // ════════════════════════════════════
        stage('Build') {
            parallel {

                stage('Frontend - Build') {
                    steps {
                        sh 'npm run build'
                        // dir('client') { sh 'npm run build' }
                    }
                }

                // ── Uncomment if backend uses TypeScript ──
                // stage('Backend - Build') {
                //     steps {
                //         dir('server') {
                //             sh 'npm run build'
                //         }
                //     }
                // }
            }
        }

        // ════════════════════════════════════
        // STAGE 6 — Build Docker Image
        // ════════════════════════════════════
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest'
                echo "Built image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }

        // ════════════════════════════════════
        // STAGE 7 — Push to Docker Hub
        // ════════════════════════════════════
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG}'
                    sh 'docker push ${DOCKER_IMAGE}:latest'
                    echo "Pushed: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }

        // ════════════════════════════════════
        // STAGE 8 — Deploy
        // ════════════════════════════════════
        stage('Deploy') {
            steps {
                sh '''
                    docker stop sample-form || true
                    docker rm   sample-form || true

                    # Frontend served by Nginx on port 80 inside container
                    docker run -d \
                        --name sample-form \
                        --restart unless-stopped \
                        -p 3000:80 \
                        ${DOCKER_IMAGE}:latest

                    echo "Deployed on port 3000"
                '''

                // ── Uncomment when backend is added ──
                // sh '''
                //     docker stop sample-form || true
                //     docker rm   sample-form || true
                //     docker run -d \
                //         --name sample-form \
                //         --restart unless-stopped \
                //         -p 3000:5000 \
                //         -e MONGO_URI=${MONGO_URI} \
                //         -e JWT_SECRET=${JWT_SECRET} \
                //         -e NODE_ENV=production \
                //         ${DOCKER_IMAGE}:latest
                // '''
            }
        }

        // ════════════════════════════════════
        // STAGE 9 — Smoke Test
        // ════════════════════════════════════
        stage('Smoke Test') {
            steps {
                sh '''
                    sleep 5
                    curl --fail --retry 5 --retry-delay 3 http://localhost:3000 || exit 1
                    echo "App is live!"
                '''

                // ── Uncomment when backend is added ──
                // sh '''
                //     curl --fail http://localhost:3000/api/health || exit 1
                //     echo "Backend health check passed!"
                // '''
            }
        }
    }

    // ════════════════════════════════════
    // POST ACTIONS
    // ════════════════════════════════════
    post {
        success {
            echo 'Pipeline completed successfully!'
            // ── Uncomment for Slack notifications ──
            // slackSend channel: '#ci-cd', color: 'good',
            //            message: "Build #${BUILD_NUMBER} succeeded!"
        }
        failure {
            echo 'Pipeline failed — check the logs!'
            // ── Uncomment for Slack notifications ──
            // slackSend channel: '#ci-cd', color: 'danger',
            //            message: "Build #${BUILD_NUMBER} FAILED!"
        }
        always {
            sh 'docker logout || true'
            // ── Uncomment to clean workspace after build ──
            // cleanWs()
        }
    }
}
