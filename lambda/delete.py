import json
import boto3
import logging

# Initialize logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Books')

def delete_item(book_id):
    """Delete a single item by book_id."""
    logger.info(f"Attempting to delete item with book_id: {book_id}")
    table.delete_item(Key={'book_id': book_id})

def lambda_handler(event, context):
    try:
        # Extract the book_id from path parameters
        book_id = event['pathParameters'].get('id')
        
        if book_id:
            delete_item(book_id)
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
                },
                'body': json.dumps({'message': f'Item with book_id {book_id} deleted'})
            }
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
                },
                'body': json.dumps({'message': 'No book_id provided'})
            }
    except Exception as e:
        logger.error(f"Error deleting item: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
            },
            'body': json.dumps({'message': 'Error deleting item', 'error': str(e)})
        }
