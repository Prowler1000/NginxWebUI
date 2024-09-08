UPDATE public."Auth"
	SET directives='{"error_page          401 = @goauthentik_proxy_signin;"}'
	WHERE id=1;
