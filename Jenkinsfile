pipeline {

    agent any

    stages {

        stage('Docker Check') {
            steps {
                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" --version'
            }
        }

        stage('Docker Compose Build') {
            steps {
                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" compose build'
            }
        }

        stage('Docker Compose Up') {
            steps {
                bat '"C:\\Users\\manik\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" compose up -d'
            }
        }
    }

    post {

        success {
            echo 'Docker Compose deployment successful!'
        }

        failure {
            echo 'Docker Compose deployment failed!'
        }
    }
}