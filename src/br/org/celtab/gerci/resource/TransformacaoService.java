package br.org.celtab.gerci.resource;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import br.org.celtab.gerci.controllers.ColTransformacaoCoordenadas;
import br.org.celtab.gerci.model.Transformacao;


@Path("/transformacao")
public class TransformacaoService {
	
	@POST
	@Path("/transforma")
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	public Response getTransformacao(Transformacao transformacao) {
				
		return Response.status(200).entity(ColTransformacaoCoordenadas.serviceTransformacao(transformacao)).build();
	}
	
}