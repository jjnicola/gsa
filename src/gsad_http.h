/* Greenbone Security Assistant
 * $Id$
 * Description: HTTP handling of GSA.
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

#ifndef _GSAD_HTTP_H
#define _GSAD_HTTP_H

#include <microhttpd.h>
#include <glib.h>

#include "gsad_content_type.h" /* for content_type_t */
#include "gsad_user.h"
#include "gsad_cmd.h" /* for cmd_response_data_t */

/**
 * @brief At least maximum length of rfc2822 format date.
 */
#define DATE_2822_LEN 100

/**
 * @brief Max length of cookie expires param.
 */
#define EXPIRES_LENGTH 100

/*
 * UTF-8 Error page HTML.
 */
#define UTF8_ERROR_PAGE(location) \
  "<html>"                                                            \
  "<head><title>Invalid request</title></head>"                       \
  "<body>The request contained invalid UTF-8 in " location ".</body>" \
  "</html>"

/**
 * @brief Name of the cookie used to store the SID.
 */
#define SID_COOKIE_NAME "GSAD_SID"

/**
 * @brief Title for "Page not found" messages.
 */
#define NOT_FOUND_TITLE "Invalid request"

/**
 * @brief Main message for "Page not found" messages.
 */
#define NOT_FOUND_MESSAGE "The requested page or file does not exist."

/**
 * @brief Error page HTML.
 */
#define ERROR_PAGE "<html><body>HTTP Method not supported</body></html>"

/**
 * @brief Bad request error HTML.
 */
#define BAD_REQUEST_PAGE "<html><body>Bad request.</body></html>"

/**
 * @brief Server error HTML.
 */
#define SERVER_ERROR \
  "<html><body>An internal server error has occurred.</body></html>"

#undef MAX_HOST_LEN

/**
 * @brief Maximum length of the host portion of the redirect address.
 */
#define MAX_HOST_LEN 1000

#define LOGIN_URL "/login"
#define LOGOUT_URL "/logout"

/**
 * @brief Buffer size for POST processor.
 */
#define POST_BUFFER_SIZE 500000

/**
 * @brief The symbol is deprecated, but older versions (0.9.37 - Debian
 * jessie) don't define it yet.
 */
#ifndef MHD_HTTP_NOT_ACCEPTABLE
#define MHD_HTTP_NOT_ACCEPTABLE MHD_HTTP_METHOD_NOT_ACCEPTABLE
#endif

/**
 * @brief Maximum length of "file name" for /help/ URLs.
 */
#define MAX_FILE_NAME_SIZE 128

/**
 * @brief Connection information.
 *
 * These objects are used to hold connection information
 * during the multiple calls of the request handler that
 * refer to the same request.
 *
 * Once a request is finished, the object will be free'd.
 */
typedef struct gsad_connection_info
{
  struct MHD_PostProcessor *postprocessor; ///< POST processor.
  char *response;                          ///< HTTP response text.
  params_t *params;                        ///< Request parameters.
  char *cookie;                            ///< Value of SID cookie param.
  char *language;                          ///< Language code e.g. en
  int connectiontype;                      ///< 1=POST, 2=GET.
  int answercode;                          ///< HTTP response code.
  content_type_t content_type;             ///< Content type of response.
  char *content_disposition;               ///< Content disposition of response.
  size_t content_length;                   ///< Content length.
  gchar *redirect;                         ///< Redirect URL.
} gsad_connection_info_t;

typedef struct MHD_Connection http_connection_t;

typedef struct MHD_Response http_response_t;


content_type_t guess_content_type(gchar *path);

void gsad_add_content_type_header (http_response_t *response,
                                   content_type_t *ct);


int handler_send_response (http_connection_t *connection,
                           http_response_t *response,
                           content_type_t *content_type,
                           char *content_disposition,
                           int http_response_code,
                           int remove_cookie);

int handler_send_not_found (http_connection_t *connection,
                            const gchar *url);

int handler_send_login_page(http_connection_t *connection,
                            int http_status_code, const gchar *message,
                            const gchar *url);

int send_response (http_connection_t *connection, const char *content,
                   int status_code, const gchar *sid,
                   content_type_t content_type,
                   const char *content_disposition,
                   size_t content_length);

int send_redirect_to_urn (http_connection_t *connection, const char *urn,
                          user_t *user);

int send_redirect_to_uri (http_connection_t *connection, const char *uri,
                          user_t *user);


void add_security_headers (http_response_t *response);

void add_guest_chart_content_security_headers (http_response_t *response);

void add_cors_headers (http_response_t *response);

/* helper functions required in gsad_http */
http_response_t *
file_content_response (credentials_t *credentials,
                       http_connection_t *connection, const char *url,
                       int *http_response_code, content_type_t *content_type,
                       char **content_disposition);

gboolean is_export(http_connection_t *connection);

gchar * reconstruct_url (http_connection_t *connection, const char *url);

int get_client_address (http_connection_t *conn, char *client_address);

int serve_post (void *coninfo_cls, enum MHD_ValueKind kind, const char *key,
                const char *filename, const char *content_type,
                const char *transfer_encoding, const char *data, uint64_t off,
                size_t size);

int remove_sid (http_response_t *response);

int attach_sid (http_response_t *response, const char *sid);


/* params_append_mhd, exec_omp_... are still in gsad.c */
char * exec_omp_get (http_connection_t *connection,
                     credentials_t *credentials,
                     content_type_t *content_type,
                     gchar **content_type_string,
                     char **content_disposition,
                     gsize *response_size,
                     cmd_response_data_t *response_data);

int exec_omp_post (gsad_connection_info_t *con_info, user_t **user_return,
                   gchar **new_sid, const char *client_address);

int params_append_mhd (params_t *params, const char *name, const char *filename,
                       const char *chunk_data, int chunk_size,
                       int chunk_offset);


char * gsad_message (credentials_t *, const char *, const char *, int,
                     const char *, const char *, cmd_response_data_t *);

gchar *login_xml (const gchar *, const gchar *, const gchar *, const gchar *,
                  const gchar *, const gchar *);

#endif /* _GSAD_HTTP_H */