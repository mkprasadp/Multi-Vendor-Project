pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Getting project from GitHub...'
            }
        }

        stage('Test Jenkins') {
            steps {
                echo 'Jenkins successfully connected to my project!'
            }
        }

        stage('Build') {
            steps {
                echo 'Building project...'
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline Successful!'
        }

        failure {
            echo 'CI Pipeline Failed!'
        }
    }
}