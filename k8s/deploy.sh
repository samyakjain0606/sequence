#!/bin/bash
set -e

# Configuration variables
ECR_REGION="us-west-2" # Change to your AWS region
ECR_REPOSITORY_NAME="sequence-game"
EKS_CLUSTER_NAME="your-eks-cluster" # Change to your EKS cluster name
NAMESPACE="sequence-game"

# Login to AWS ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region $ECR_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$ECR_REGION.amazonaws.com

# Create ECR repository if it doesn't exist
echo "Creating ECR repository if it doesn't exist..."
aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region $ECR_REGION || aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $ECR_REGION

# Get the ECR repository URI
ECR_REPOSITORY_URI=$(aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region $ECR_REGION --query 'repositories[0].repositoryUri' --output text)

# Build and push client Docker image
echo "Building and pushing client Docker image..."
docker build -t $ECR_REPOSITORY_URI/sequence-client:latest -f Dockerfile .
docker push $ECR_REPOSITORY_URI/sequence-client:latest

# Build and push server Docker image
echo "Building and pushing server Docker image..."
docker build -t $ECR_REPOSITORY_URI/sequence-server:latest -f server-dockerfile .
docker push $ECR_REPOSITORY_URI/sequence-server:latest

# Configure kubectl to use the EKS cluster
echo "Configuring kubectl to use the EKS cluster..."
aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $ECR_REGION

# Create namespace if it doesn't exist
echo "Creating namespace if it doesn't exist..."
kubectl apply -f k8s/namespace.yaml

# Replace the ECR repository URI in the Kubernetes manifests
echo "Updating Kubernetes manifests with ECR repository URI..."
sed -i "s|\${ECR_REPOSITORY_URI}|$ECR_REPOSITORY_URI|g" k8s/client-deployment.yaml
sed -i "s|\${ECR_REPOSITORY_URI}|$ECR_REPOSITORY_URI|g" k8s/server-deployment.yaml

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/client-deployment.yaml
kubectl apply -f k8s/server-deployment.yaml
kubectl apply -f k8s/client-service.yaml
kubectl apply -f k8s/server-service.yaml
kubectl apply -f k8s/ingress.yaml

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/sequence-client -n $NAMESPACE
kubectl rollout status deployment/sequence-server -n $NAMESPACE

# Get Ingress URL
echo "Getting Ingress URL..."
INGRESS_URL=$(kubectl get ingress sequence-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Deployment complete! Access your application at: http://$INGRESS_URL" 