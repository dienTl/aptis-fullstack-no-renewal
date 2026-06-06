package com.aptisfullstack.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.aptisfullstack.exception.ApiException;
import java.nio.file.*;
import java.util.Map;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
  @Value("${app.upload-dir}") String uploadDir;
  @Value("${app.cloudinary.cloud-name:}") String cloudName;
  @Value("${app.cloudinary.api-key:}") String apiKey;
  @Value("${app.cloudinary.api-secret:}") String apiSecret;

  public String store(MultipartFile file, String folder) {
    if (file == null || file.isEmpty()) throw ApiException.bad("File is required");
    if (cloudinaryConfigured()) return storeCloudinary(file, folder);
    return storeLocal(file, folder);
  }

  private String storeCloudinary(MultipartFile file, String folder) {
    try {
      Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
          "cloud_name", cloudName,
          "api_key", apiKey,
          "api_secret", apiSecret,
          "secure", true
      ));
      Map upload = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
          "folder", "aptis-fullstack/" + folder,
          "resource_type", "auto"
      ));
      return Objects.toString(upload.get("secure_url"), "");
    } catch (Exception e) {
      throw ApiException.bad("Cannot upload file to Cloudinary");
    }
  }

  private String storeLocal(MultipartFile file, String folder) {
    try {
      Path dir = Path.of(uploadDir, folder);
      Files.createDirectories(dir);
      String original = Objects.requireNonNull(file.getOriginalFilename()).replaceAll("[^a-zA-Z0-9._-]", "_");
      String name = System.currentTimeMillis() + "-" + original;
      file.transferTo(dir.resolve(name));
      return "/uploads/" + folder + "/" + name;
    } catch (Exception e) {
      throw ApiException.bad("Cannot upload file");
    }
  }

  private boolean cloudinaryConfigured() {
    return hasText(cloudName) && hasText(apiKey) && hasText(apiSecret);
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}
