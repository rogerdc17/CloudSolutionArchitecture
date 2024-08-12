import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Books')

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o)  # Convert Decimal to int
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    try:
        response = table.scan()
        items = response['Items']
        
        # Convert Decimal types to int for JSON serialization
        for item in items:
            for key, value in item.items():
                if isinstance(value, Decimal):
                    item[key] = int(value)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'  # Adjust methods as needed
            },
            'body': json.dumps(items, cls=DecimalEncoder)  # Use DecimalEncoder here
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'  # Adjust methods as needed
            },
            'body': json.dumps({'message': 'Error retrieving items', 'error': str(e)})
        }
