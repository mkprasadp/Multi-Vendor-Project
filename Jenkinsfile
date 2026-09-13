pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out latest code from GitHub...'
            }
        }

        stage('Docker Check') {
            steps {
                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" --version'
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo 'Building all MutiVendor services...'

                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker-compose.exe" build'
            }
        }
        
        stage('Deploy') {    
            steps {
                echo 'Stopping old containers...'

                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker-compose.exe" down'

                echo 'Starting new containers...'

                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker-compose.exe" up -d'
            }
        }

        stage('Verify Containers') {
            steps {
                echo 'Checking running containers...'

                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" ps'
            }
        }
    }

    post {

        success {
            echo 'MutiVendor deployed successfully!'
        }

        failure {
            echo 'Deployment failed!'
        }
    }
}