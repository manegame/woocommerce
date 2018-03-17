<?php
/**
 * Copyright (C) 2014-2017 ServMask Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * ███████╗███████╗██████╗ ██╗   ██╗███╗   ███╗ █████╗ ███████╗██╗  ██╗
 * ██╔════╝██╔════╝██╔══██╗██║   ██║████╗ ████║██╔══██╗██╔════╝██║ ██╔╝
 * ███████╗█████╗  ██████╔╝██║   ██║██╔████╔██║███████║███████╗█████╔╝
 * ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║╚██╔╝██║██╔══██║╚════██║██╔═██╗
 * ███████║███████╗██║  ██║ ╚████╔╝ ██║ ╚═╝ ██║██║  ██║███████║██║  ██╗
 * ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
 */

class Ai1wm_File_Webconfig {

	/**
	 * Create web.config file
	 *
	 * The method will create web.config file with contents '<mimeMap fileExtension=".wpress" mimeType="application/octet-stream" />'
	 *
	 * @param  string  $path Path to the web.config file
	 * @return boolean
	 */
	public static function create( $path ) {
		$contents = "<configuration>\n" .
						"<system.webServer>\n" .
							"<staticContent>\n" .
								"<mimeMap fileExtension=\".wpress\" mimeType=\"application/octet-stream\" />\n" .
							"</staticContent>\n" .
							"<defaultDocument>\n" .
								"<files>\n" .
									"<add value=\"index.php\" />\n" .
								"</files>\n" .
							"</defaultDocument>\n" .
							"<directoryBrowse enabled=\"false\" />\n" .
						"</system.webServer>\n" .
					"</configuration>\n";

		return Ai1wm_File::create( $path, $contents );
	}
}
