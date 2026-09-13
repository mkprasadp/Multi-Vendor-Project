pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Getting code from GitHub...'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t manikantaprasad123/myapp:latest .'
            }
        }

        stage('Docker Push') {
            steps {
                bat 'docker push manikantaprasad123/myapp:latest'
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