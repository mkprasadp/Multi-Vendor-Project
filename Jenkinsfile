pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Getting code from GitHub...'
            }
        }

        stage('Docker Check') {
            steps {
                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" --version'
            }
        }

        stage('Docker Build') {
            steps {
                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" build -t manikantaprasad123/myapp:latest .'
            }
        }

        stage('Docker Push') {
            steps {
                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" push manikantaprasad123/myapp:latest'
            }
        }
    }

    post {
        success {
            echo 'Docker image pushed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}