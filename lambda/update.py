import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Books')

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)  # Convert Decimal to float
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    try:
        # Extract the book_id from path parameters
        book_id = event['pathParameters']['id']
        
        # Parse the updated book data from the request body
        book = json.loads(event['body'])
        
        # Ensure 'book_id' is included in the item to match the primary key
        book['book_id'] = book_id
        
        # Update the item in DynamoDB
        response = table.update_item(
            Key={'book_id': book_id},
            UpdateExpression='SET #Title = :Title, #Authors = :Authors, #Publisher = :Publisher, #Year = :Year',
            ConditionExpression='attribute_exists(book_id)',
            ExpressionAttributeNames={
                '#Title': 'Title',
                '#Authors': 'Authors',
                '#Publisher': 'Publisher',
                '#Year': 'Year'
            },
            ExpressionAttributeValues={
                ':Title': book.get('Title'),
                ':Authors': book.get('Authors'),
                ':Publisher': book.get('Publisher'),
                ':Year': int(book.get('Year')) if book.get('Year') is not None else None
            },
            ReturnValues='ALL_NEW'
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'  # Allow necessary methods
            },
            'body': json.dumps({
                'message': 'Item updated successfully',
                'item': response.get('Attributes', {})
            }, cls=DecimalEncoder)  # Use DecimalEncoder here
        }
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
            },
            'body': json.dumps({'message': 'Item not found', 'book_id': book_id})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
            },
            'body': json.dumps({'message': 'Error updating item', 'error': str(e)})
        }
