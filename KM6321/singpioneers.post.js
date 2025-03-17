const Router = require('koa-router')
const neo4j = require('neo4j-driver')

// Router prefix is /SPpost
const SPpost_router = new Router({
	prefix: '/SPpost'
})



/**************************************************************/
/*** Script to access singpioneers neo4j database           ***/
/*** Need to accept query parameters as JSON file in the body of the message ***/

    /** Neo4j Cypher query texts **/

    /* Queries with no parameters */
	const query_interethnic =
	`MATCH p=((Person1:Person)–[R*1..2]-(Person2:Person))
	 WHERE Person1.race IS NOT NULL AND Person2.race IS NOT NULL AND 
	       Person1.race <> Person2.race AND 
		   none(x IN relationships(p) WHERE type(x) = 'type')  // type relation excluded from path
     RETURN p`

	const query_interethnic_table =   // List in table
	`MATCH p=((Person1:Person)–[R*1..2]-(Person2:Person))
	 WHERE Person1.race IS NOT NULL AND Person2.race IS NOT NULL AND 
	       Person1.race <> Person2.race AND 
		   none(x IN relationships(p) WHERE type(x) = 'type')  // type relation excluded from path
     RETURN DISTINCT Person1.label as Person1, Person1.race, Person2.label as Person2, Person2.race, [x IN nodes(p) | x.label] as In_between_entities, [y IN relationships(p) | y.type] as Relation_links
	 ORDER BY Person1.label, Person2.label`


	const query_multi =
    `MATCH p=((Person1:Person)–[R1]-(Person2:Person)-[R2]-(Person1:Person))
	 WHERE R1<>R2
     RETURN p`

	const query_multi2 =   // longer paths
    `MATCH p=((Person1:Person)–[R1]-()-[R]-(Person2:Person)-[R2]-(Person1:Person))
	 WHERE R1<>R2 AND type(R)<>'type'
     RETURN p`


	const query_triad =
	`MATCH p=((Person1:Person)–[*1..2]-(Person2:Person)-[*1..2]-(Person3:Person)-[*1..2]-(Person1:Person))
	 WHERE none(x IN relationships(p) WHERE type(x) = 'type')  // type relation excluded
     RETURN p`

	const query_triad_table =  // list in table
	`MATCH p=((Person1:Person)–[*1..2]-(Person2:Person)-[*1..2]-(Person3:Person)-[*1..2]-(Person1:Person))
	 WHERE Person2 <> Person3 AND none(x IN relationships(p) WHERE type(x) = 'type')  // type relation excluded
     RETURN DISTINCT Person1.label as Person1, Person2.label as Person2, Person3.label as Person3
	 ORDER BY Person1.label, Person2.label, Person3.label`
	
	
    /* Queries with 1 parameter */
	
    // Retrieve neighboring nodes for the specified node
    const query0 =
    `MATCH (Entity1 {id: $param1})-[R]-(Entity2)
    RETURN Entity1, R, Entity2 LIMIT 30`

    // Show specified Person and kinship links
	// 1 link
    const query1a =
	`MATCH (Person1 {id: $param1})–[R:kinship]-(Person2)
     RETURN Person1, R, Person2`

    // Display 1 entity node
    const query1b =
	`MATCH (Entity {id: $param1})
     RETURN Entity`

    // Display links that match a relation (given in param2)
    const query_relation =
	`MATCH (Entity1)–[R]-(Entity2)
	 WHERE type(R) = $param2
     RETURN Entity1, R, Entity2`

    // Display links that match a list of relations (given in param2)
    const query_relationList =
	`MATCH (Entity1)–[R]-(Entity2)
	 WHERE type(R) in $param2
     RETURN Entity1, R, Entity2`

    // Display links that match a relation type attribute (given in param2)
    const query_rel_type =
	`MATCH (Entity1)–[R {type: $param2}]-(Entity2)
     RETURN Entity1, R, Entity2`

    // Display links that match a relation type attribute (specify list of attribute values to match in param2)
    const query_rel_typeList =
	`MATCH (Entity1)–[R]-(Entity2)
	 WHERE R.type in $param2
     RETURN Entity1, R, Entity2`


    // Display nodes (and neighbor nodes) that match the node LABEL (specify list of LABELs to match in param2)
    const query_node_labelList =
	`MATCH (Entity1)–[R]-(Entity2)
	 WHERE R.type <> 'type' AND any(label IN labels(Entity1) WHERE label IN $param2)
     RETURN Entity1, R, Entity2`

    // Display nodes (and neighbor nodes) that match the node type attribute (specify list of types to match in param2)
    const query_node_typeList =
	`MATCH (Entity1)–[R]-(Entity2)
	 WHERE Entity1.type in $param2 AND R.type <> 'type'
     RETURN Entity1, R, Entity2`


	
    /* Queries with 2 parameters */
	
	// $param1 is an entity (usually person), param2 is a list of relations to match
	const query2a =
	`MATCH (Person1 {id: $param1})–[R]-(Person2)
	 WHERE type(R) in $param2
     RETURN Person1, R, Person2`

    // Find shortest path between 2 entities
    const query_path =
    `MATCH (entityA {id: $param1}), (entityB {id: $param2}),
            path = shortestPath ( (entityA)-[*1..5]-(entityB)  )
     WHERE none(x IN relationships(path) WHERE type(x) = 'type')  // type relation excluded
     RETURN path`


    /* Keyword search in Nodes */
	const searchNode =
	`CALL db.index.fulltext.queryNodes("SingPioneers_keyword", $param2) YIELD node  
     RETURN node ORDER BY node.label`
    // `MATCH (n) WHERE n.label=~ $parameter  // Search with regular expression
	// RETURN n ORDER BY n.label`, { parameter: ".*"+keyword+".*" }



/** Create connection object for neo4j database **/
const driver = neo4j.driver(
    'neo4j+s://9cbb4e62.databases.neo4j.io',
    neo4j.auth.basic('anonymous', 'anonymous')
)
 
 
/** Main async function to submit query, retrieve graph **/
async function retrieve(queryText, parameter1, parameter2) {

    // create a session for neo4j driver
    const session = driver.session({ defaultAccessMode: neo4j.session.READ })

    try {
      const result = await session.readTransaction(tx =>
        tx.run(
           queryText, { param1: parameter1 , param2: parameter2}
        )
      )

      return(result.records)

    } catch (error) {
      console.log(`unable to execute query. ${error}`)
    } finally {
      session.close()
    }
}



/** Functions for mapping queryID to queryText **/

const help = (ctx, next) => {
	ctx.response.type = 'json';
	ctx.response.body = {
		'help': 'To retrieve graph (in JSON format) from SingPioneers knowledge graph, POST the parameters in JSON format: {queryID: XXX, param1: XXX, param2: XXX}'
	}
  }


const SP_retrieve_graph = async (ctx, next) => {
  // Check if any of the data field is empty
  if ( !ctx.request.body.queryID ||    // HTTP (Web) Request from the Web browser
       !ctx.request.body.param1 ||
       !ctx.request.body.param2 )
  {
       ctx.response.status = 400;      // HTTP Respose to the Web browser
       ctx.response.type = 'html';
       ctx.response.body = '<p>Please POST data in JSON format: {queryID: XXX, param1: XXX, param2: XXX}</p>';
  } else {
	
    try {
      ctx.response.type = 'json';
      let param1 = ctx.request.body.param1
      let param2 = ctx.request.body.param2
	  switch (ctx.request.body.queryID) {      // map queryID to queryText
		case 'interethnic': ctx.response.body = await retrieve(query_interethnic, param1, param2); break;
		case 'interethnic_table': ctx.response.body = await retrieve(query_interethnic_table, param1, param2); break;
		case 'multi': ctx.response.body = await retrieve(query_multi, param1, param2); break;
		case 'multi2': ctx.response.body = await retrieve(query_multi2, param1, param2); break;
		case 'triad': ctx.response.body = await retrieve(query_triad, param1, param2); break;
		case 'triad_table': ctx.response.body = await retrieve(query_triad_table, param1, param2); break;
		case '0': ctx.response.body = await retrieve(query0, param1, param2); break;
		case '1a': ctx.response.body = await retrieve(query1a, param1, param2); break;
		case '1b': ctx.response.body = await retrieve(query1b, param1, param2); break;
		case 'relation': ctx.response.body = await retrieve(query_relation, param1, param2); break;
		case 'relationList': ctx.response.body = await retrieve(query_relationList, param1, param2); break;
		case 'rel_type': ctx.response.body = await retrieve(query_rel_type, param1, param2); break;
		case 'rel_typeList': ctx.response.body = await retrieve(query_rel_typeList, param1, param2); break;
		case 'node_labelList': ctx.response.body = await retrieve(query_node_labelList, param1, param2); break;
		case 'node_typeList': ctx.response.body = await retrieve(query_node_typeList, param1, param2); break;
		case 'class_rel2': ctx.response.body = await retrieve(query_class_rel2, param1, param2); break;
		case '2a': ctx.response.body = await retrieve(query2a, param1, param2); break;
		case 'path': ctx.response.body = await retrieve(query_path, param1, param2); break;
		case 'searchKeyword': ctx.response.body = await retrieve(searchNode, param1, param2); break;
        default: ctx.response.body = {
          'message': 'Invalid queryID',
	      'queryID': ctx.request.body.queryID,
          'param1': param1 ,
		  'param2': param2 ,
        } 
      }
	// await next();
    } catch (err) {
      ctx.response.status = err.statusCode || err.status || 500;
      ctx.response.type = 'html';
      ctx.response.body = '<p>Something wrong</p>';
      ctx.app.emit('error', err, ctx);
    }
  }
}


// Routes go here
// POST method
SPpost_router.post('/', SP_retrieve_graph)
SPpost_router.get('/', help)

module.exports = SPpost_router;